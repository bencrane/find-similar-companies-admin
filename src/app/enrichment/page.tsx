"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface BatchStatus {
  status: "pending" | "processing" | "completed" | "completed_with_errors" | "error";
  progress_percent: number;
  processed_domains: number;
  total_domains: number;
  similar_companies_found?: number;
  errors?: number;
}

export default function EnrichmentPage() {
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [batchSize, setBatchSize] = useState(200);
  const [similarityWeight, setSimilarityWeight] = useState(0.5);
  const [countryCode, setCountryCode] = useState("");
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
        const url = `${apiUrl}/api/enrichment/similar-companies/pending?limit=1`;
        console.log("Fetching count from:", url);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        console.log("Count API response:", data);
        setPendingCount(data.total ?? 0);
      } catch (err) {
        console.error("Failed to fetch pending count:", err);
        setPendingCount(null);
      }
    };
    fetchPendingCount();
  }, [apiUrl]);

  const submitBatch = async () => {
    setIsLoading(true);
    setError(null);
    setBatchStatus(null);

    try {
      const body: Record<string, unknown> = {
        batch_size: batchSize,
        similarity_weight: similarityWeight,
      };

      // Only include country_code if provided
      if (countryCode.trim()) {
        body.country_code = countryCode.trim().toUpperCase();
      } else {
        body.country_code = null;
      }

      console.log("Submitting batch:", body);

      const res = await fetch(`${apiUrl}/api/enrichment/similar-companies/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      console.log("Batch response:", data);

      if (data.batch_id) {
        setBatchId(data.batch_id);
        startPolling(data.batch_id);
      } else {
        setError(data.error || "Failed to start batch");
      }
    } catch (err) {
      setError(`Failed to submit batch: ${err}`);
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
          // Refresh pending count
          refreshPendingCount();
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    poll();
    pollingRef.current = setInterval(poll, 3000);
  };

  const refreshPendingCount = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/enrichment/similar-companies/pending?limit=1`);
      const data = await res.json();
      setPendingCount(data.total ?? 0);
    } catch (err) {
      console.error("Failed to refresh count:", err);
    }
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
      <main className="p-8 max-w-2xl">
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Batch Settings */}
        <section className="mb-8 p-6 rounded-xl border border-gray-800 bg-gray-900/50">
          <h2 className="text-white font-semibold mb-2">Batch Settings</h2>
          <p className="text-gray-400 text-sm mb-6">
            {pendingCount !== null ? (
              <>{pendingCount} domains pending enrichment</>
            ) : (
              <>Loading pending count...</>
            )}
          </p>

          <div className="space-y-4">
            {/* Batch Size */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Batch Size</label>
              <input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                min={1}
                max={500}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Number of domains to process (max 500)</p>
            </div>

            {/* Similarity Weight */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Similarity Weight: {similarityWeight.toFixed(1)}
              </label>
              <input
                type="range"
                value={similarityWeight}
                onChange={(e) => setSimilarityWeight(Number(e.target.value))}
                min={-1}
                max={1}
                step={0.1}
                className="w-full accent-white"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>-1.0 (Diverse)</span>
                <span>0.0 (Balanced)</span>
                <span>1.0 (Similar)</span>
              </div>
            </div>

            {/* Country Code */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Country Code (optional)</label>
              <input
                type="text"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                placeholder="e.g., US"
                maxLength={2}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for all countries</p>
            </div>
          </div>

          <button
            onClick={submitBatch}
            disabled={isLoading || isPolling || pendingCount === 0}
            className="mt-6 w-full px-6 py-3 bg-white text-black rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Starting..." : isPolling ? "Processing..." : "Start Batch"}
          </button>
        </section>

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

            <button
              onClick={() => {
                setBatchId(null);
                setBatchStatus(null);
              }}
              className="mt-4 text-sm text-gray-400 hover:text-white"
            >
              Start New Batch
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
