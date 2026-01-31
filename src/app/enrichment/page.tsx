"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import Papa from "papaparse";

interface BatchStatus {
  status: "pending" | "processing" | "completed" | "completed_with_errors" | "error";
  progress_percent: number;
  processed_domains: number;
  total_domains: number;
  similar_companies_found?: number;
  errors?: number;
}

export default function EnrichmentPage() {
  const [sourceType, setSourceType] = useState<"pending" | "csv">("pending");
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [domains, setDomains] = useState<string[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [batchSize, setBatchSize] = useState(200);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [batchStatus, setBatchStatus] = useState<BatchStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // Load pending domains count on mount
  useEffect(() => {
    const fetchPendingCount = async () => {
      if (!apiUrl) {
        console.error("NEXT_PUBLIC_API_URL is not set");
        setError("API URL not configured");
        return;
      }
      try {
        const res = await fetch(`${apiUrl}/api/enrichment/similar-companies/pending?limit=1`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        console.log("Pending count response:", data);
        setPendingCount(data.total || 0);
      } catch (err) {
        console.error("Failed to fetch pending count:", err);
        setPendingCount(null);
      }
    };
    fetchPendingCount();
  }, [apiUrl]);

  const loadPendingDomains = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching from:", `${apiUrl}/api/enrichment/similar-companies/pending?limit=500`);
      const res = await fetch(`${apiUrl}/api/enrichment/similar-companies/pending?limit=500`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log("Load response:", data);
      const loadedDomains = data.pending_domains || [];
      setDomains(loadedDomains);
      setSelectedDomains(new Set(loadedDomains));
      setPendingCount(data.total || loadedDomains.length);
    } catch (err) {
      setError(`Failed to load pending domains: ${err}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedDomains = results.data
          .map((row) => row.domain || row.Domain)
          .filter((domain): domain is string => !!domain)
          .map((domain) => domain.trim().toLowerCase());

        // Deduplicate
        const uniqueDomains = [...new Set(parsedDomains)];
        setDomains(uniqueDomains);
        setSelectedDomains(new Set(uniqueDomains));
      },
      error: (err) => {
        setError("Failed to parse CSV");
        console.error(err);
      },
    });
  }, []);

  const toggleDomain = (domain: string) => {
    setSelectedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) {
        next.delete(domain);
      } else {
        next.add(domain);
      }
      return next;
    });
  };

  const selectAll = () => setSelectedDomains(new Set(domains));
  const clearAll = () => setSelectedDomains(new Set());

  const submitBatch = async () => {
    if (selectedDomains.size === 0) return;

    setIsLoading(true);
    setError(null);
    setBatchStatus(null);

    try {
      const res = await fetch(`${apiUrl}/api/enrichment/similar-companies/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domains: Array.from(selectedDomains),
          batch_size: batchSize,
        }),
      });
      const data = await res.json();

      if (data.batch_id) {
        setBatchId(data.batch_id);
        startPolling(data.batch_id);
      } else {
        setError("Failed to start batch");
      }
    } catch (err) {
      setError("Failed to submit batch");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = (id: string) => {
    setIsPolling(true);

    const poll = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/enrichment/similar-companies/batch/${id}/status`);
        const data: BatchStatus = await res.json();
        setBatchStatus(data);

        if (data.status === "completed" || data.status === "completed_with_errors" || data.status === "error") {
          setIsPolling(false);
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    // Initial poll
    poll();

    // Poll every 3 seconds
    pollingRef.current = setInterval(poll, 3000);
  };

  const isCompleted = batchStatus?.status === "completed" || batchStatus?.status === "completed_with_errors";

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 px-8 py-6">
        <Link href="/admin/data-ingest" className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          <span className="font-semibold">Similar Companies Enrichment</span>
        </Link>
      </header>

      {/* Content */}
      <main className="p-8 max-w-4xl">
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Queue Status */}
        <section className="mb-8 p-6 rounded-xl border border-gray-800 bg-gray-900/50">
          <h2 className="text-white font-semibold mb-4">Queue Status</h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="source"
                checked={sourceType === "pending"}
                onChange={() => setSourceType("pending")}
                className="w-4 h-4 accent-white"
              />
              <span className="text-white">
                Load Pending Domains {pendingCount !== null && `(${pendingCount} available)`}
              </span>
              <button
                onClick={loadPendingDomains}
                disabled={sourceType !== "pending" || isLoading}
                className="ml-auto px-4 py-1.5 bg-white text-black text-sm rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Loading..." : "Load"}
              </button>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="source"
                checked={sourceType === "csv"}
                onChange={() => setSourceType("csv")}
                className="w-4 h-4 accent-white"
              />
              <span className="text-white">Upload CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={sourceType !== "csv"}
                className="ml-auto text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-4 file:rounded file:border-0 file:bg-white file:text-black file:text-sm file:font-medium file:cursor-pointer disabled:opacity-50"
              />
            </label>
          </div>
        </section>

        {/* Domains to Process */}
        {domains.length > 0 && (
          <section className="mb-8 p-6 rounded-xl border border-gray-800 bg-gray-900/50">
            <h2 className="text-white font-semibold mb-4">Domains to Process</h2>

            <div className="max-h-64 overflow-y-auto mb-4 space-y-1">
              {domains.map((domain) => (
                <label key={domain} className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDomains.has(domain)}
                    onChange={() => toggleDomain(domain)}
                    className="w-4 h-4 accent-white"
                  />
                  <span className="text-gray-300">{domain}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <button onClick={selectAll} className="text-sm text-gray-400 hover:text-white">
                Select All
              </button>
              <button onClick={clearAll} className="text-sm text-gray-400 hover:text-white">
                Clear All
              </button>
              <span className="text-sm text-gray-500 ml-auto">
                Selected: {selectedDomains.size} of {domains.length}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-white text-sm">
                Batch Size:
                <select
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-white"
                >
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={500}>500</option>
                </select>
              </label>

              <button
                onClick={submitBatch}
                disabled={selectedDomains.size === 0 || isLoading || isPolling}
                className="ml-auto px-6 py-2 bg-white text-black rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Batch
              </button>
            </div>
          </section>
        )}

        {/* Active Batch */}
        {batchId && batchStatus && !isCompleted && (
          <section className="mb-8 p-6 rounded-xl border border-gray-800 bg-gray-900/50">
            <h2 className="text-white font-semibold mb-4">Active Batch</h2>

            <div className="space-y-2 text-sm">
              <p className="text-gray-400">Batch: <span className="text-white font-mono">{batchId}</span></p>
              <p className="text-gray-400">Status: <span className="text-yellow-400">{batchStatus.status}</span></p>

              <div className="pt-2">
                <div className="flex justify-between text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{batchStatus.processed_domains} / {batchStatus.total_domains}</span>
                </div>
                <div className="w-full bg-gray-700 rounded h-2">
                  <div
                    className="bg-white h-2 rounded transition-all"
                    style={{ width: `${batchStatus.progress_percent}%` }}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Results */}
        {isCompleted && batchStatus && (
          <section className="p-6 rounded-xl border border-gray-800 bg-gray-900/50">
            <h2 className="text-white font-semibold mb-4">Results</h2>

            <div className="space-y-2 text-sm">
              <p className="text-green-400 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Completed: {batchStatus.processed_domains} domains processed
              </p>
              {batchStatus.similar_companies_found !== undefined && (
                <p className="text-gray-400">
                  Similar companies found: <span className="text-white">{batchStatus.similar_companies_found}</span>
                </p>
              )}
              {batchStatus.errors !== undefined && batchStatus.errors > 0 && (
                <p className="text-red-400">
                  Errors: {batchStatus.errors}
                </p>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
