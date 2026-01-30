"use client";

import { useState, useCallback } from "react";
import Papa from "papaparse";

interface SimilarCompany {
  company_name: string;
  company_domain: string;
  company_industry: string;
  similarity_score: number;
}

interface ApiResponse {
  success: boolean;
  domain: string;
  source: string;
  similar_companies: SimilarCompany[];
  count: number;
}

interface DomainResult {
  domain: string;
  status: "pending" | "loading" | "success" | "error";
  similar_companies?: SimilarCompany[];
  error?: string;
}

export default function EnrichmentPage() {
  const [domains, setDomains] = useState<DomainResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedDomains = results.data
            .map((row) => row.domain || row.Domain)
            .filter((domain): domain is string => !!domain)
            .map((domain) => ({
              domain: domain.trim().toLowerCase(),
              status: "pending" as const,
            }));
          setDomains(parsedDomains);
          setProgress({ current: 0, total: parsedDomains.length });
        },
        error: (error) => {
          console.error("CSV parsing error:", error);
        },
      });
    },
    []
  );

  const findSimilar = async () => {
    if (domains.length === 0) return;

    setProcessing(true);
    setProgress({ current: 0, total: domains.length });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    for (let i = 0; i < domains.length; i++) {
      const domain = domains[i].domain;

      setDomains((prev) =>
        prev.map((d, idx) => (idx === i ? { ...d, status: "loading" } : d))
      );

      try {
        const response = await fetch(
          `${apiUrl}/api/companies/${encodeURIComponent(domain)}/similar`
        );
        const data: ApiResponse = await response.json();

        if (data.success) {
          setDomains((prev) =>
            prev.map((d, idx) =>
              idx === i
                ? {
                    ...d,
                    status: "success",
                    similar_companies: data.similar_companies,
                  }
                : d
            )
          );
        } else {
          setDomains((prev) =>
            prev.map((d, idx) =>
              idx === i ? { ...d, status: "error", error: "API returned unsuccessful" } : d
            )
          );
        }
      } catch (error) {
        setDomains((prev) =>
          prev.map((d, idx) =>
            idx === i
              ? { ...d, status: "error", error: String(error) }
              : d
          )
        );
      }

      setProgress({ current: i + 1, total: domains.length });
    }

    setProcessing(false);
  };

  const allResults = domains.flatMap((d) =>
    (d.similar_companies || []).map((company) => ({
      source_domain: d.domain,
      ...company,
    }))
  );

  return (
    <div className="min-h-screen bg-black p-8">
      <h1 className="text-white text-2xl font-bold mb-8">Enrichment</h1>

      {/* Upload Section */}
      <div className="mb-8">
        <label className="block text-white mb-2">Upload CSV (must have "domain" column)</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="block w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-white file:text-black file:cursor-pointer"
        />
      </div>

      {/* Domains List */}
      {domains.length > 0 && (
        <div className="mb-8">
          <h2 className="text-white text-lg font-semibold mb-4">
            Uploaded Domains ({domains.length})
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {domains.map((d, idx) => (
              <span
                key={idx}
                className={`px-3 py-1 rounded text-sm ${
                  d.status === "pending"
                    ? "bg-gray-700 text-white"
                    : d.status === "loading"
                    ? "bg-yellow-600 text-white"
                    : d.status === "success"
                    ? "bg-green-700 text-white"
                    : "bg-red-700 text-white"
                }`}
              >
                {d.domain}
              </span>
            ))}
          </div>

          <button
            onClick={findSimilar}
            disabled={processing}
            className="px-6 py-2 bg-white text-black rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? "Processing..." : "Find Similar"}
          </button>
        </div>
      )}

      {/* Progress */}
      {processing && (
        <div className="mb-8">
          <p className="text-white">
            Progress: {progress.current} of {progress.total} processed
          </p>
          <div className="w-full bg-gray-700 rounded h-2 mt-2">
            <div
              className="bg-white h-2 rounded transition-all"
              style={{
                width: `${(progress.current / progress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Results Table */}
      {allResults.length > 0 && (
        <div>
          <h2 className="text-white text-lg font-semibold mb-4">
            Results ({allResults.length} similar companies found)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-white">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="py-3 px-4">Source Domain</th>
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Domain</th>
                  <th className="py-3 px-4">Industry</th>
                  <th className="py-3 px-4">Similarity</th>
                </tr>
              </thead>
              <tbody>
                {allResults.map((result, idx) => (
                  <tr key={idx} className="border-b border-gray-800">
                    <td className="py-3 px-4 text-gray-400">{result.source_domain}</td>
                    <td className="py-3 px-4">{result.company_name}</td>
                    <td className="py-3 px-4">{result.company_domain}</td>
                    <td className="py-3 px-4">{result.company_industry}</td>
                    <td className="py-3 px-4">
                      {(result.similarity_score * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
