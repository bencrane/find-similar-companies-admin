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

export default function BatchProgressPage() {
  const [batchId, setBatchId] = useState<string | null>(null);
  const [batchStatus, setBatchStatus] = useState<BatchStatus | null>(null);
  const [startTime] = useState<Date>(new Date());
  const [elapsedTime, setElapsedTime] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const timeRef = useRef<NodeJS.Timeout | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      if (timeRef.current) {
        clearInterval(timeRef.current);
      }
    };
  }, []);

  // Load batch ID from localStorage and start polling
  useEffect(() => {
    const storedBatchId = localStorage.getItem("activeBatchId");
    if (storedBatchId) {
      setBatchId(storedBatchId);
      startPolling(storedBatchId);
    }
  }, []);

  // Update elapsed time every second
  useEffect(() => {
    const updateElapsed = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      if (diff < 60) {
        setElapsedTime(`${diff} seconds ago`);
      } else {
        const minutes = Math.floor(diff / 60);
        setElapsedTime(`${minutes} minute${minutes > 1 ? "s" : ""} ago`);
      }
    };

    updateElapsed();
    timeRef.current = setInterval(updateElapsed, 1000);

    return () => {
      if (timeRef.current) {
        clearInterval(timeRef.current);
      }
    };
  }, [startTime]);

  const startPolling = (id: string) => {
    const poll = async () => {
      if (!apiUrl) {
        setError("API URL not configured");
        return;
      }

      try {
        const res = await fetch(`${apiUrl}/api/enrichment/similar-companies/batch/${id}/status`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: BatchStatus = await res.json();
        setBatchStatus(data);

        // Stop polling when completed or errored
        if (data.status === "completed" || data.status === "completed_with_errors" || data.status === "error") {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          // Clear localStorage since batch is done
          localStorage.removeItem("activeBatchId");
        }
      } catch (err) {
        console.error("Polling error:", err);
        setError(`Failed to fetch batch status: ${err}`);
      }
    };

    poll();
    pollingRef.current = setInterval(poll, 3000);
  };

  const isCompleted = batchStatus?.status === "completed" || batchStatus?.status === "completed_with_errors";
  const isError = batchStatus?.status === "error";

  // No active batch
  if (!batchId) {
    return (
      <div className="min-h-screen bg-black">
        <header className="border-b border-gray-800 px-8 py-6">
          <Link href="/enrichment" className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            <span className="font-semibold">Batch Progress</span>
          </Link>
        </header>

        <main className="p-8 max-w-2xl">
          <section className="p-6 rounded-xl border border-gray-800 bg-gray-900/50 text-center">
            <p className="text-gray-400 mb-4">No active batch found</p>
            <Link
              href="/enrichment"
              className="inline-block px-6 py-3 bg-white text-black rounded font-semibold hover:bg-gray-200 transition-colors"
            >
              Start New Batch
            </Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 px-8 py-6">
        <Link href="/enrichment" className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          <span className="font-semibold">Batch Progress</span>
        </Link>
      </header>

      {/* Content */}
      <main className="p-8 max-w-2xl">
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Progress Card */}
        <section className="p-6 rounded-xl border border-gray-800 bg-gray-900/50">
          <h2 className="text-white font-semibold text-xl mb-6">Batch Processing</h2>

          {batchStatus ? (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Status:</span>
                {isCompleted ? (
                  <span className="text-green-400 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    Completed
                  </span>
                ) : isError ? (
                  <span className="text-red-400">Error</span>
                ) : (
                  <span className="text-yellow-400">{batchStatus.status}</span>
                )}
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{batchStatus.progress_percent}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded h-3">
                  <div
                    className={`h-3 rounded transition-all ${isCompleted ? "bg-green-500" : isError ? "bg-red-500" : "bg-white"}`}
                    style={{ width: `${batchStatus.progress_percent}%` }}
                  />
                </div>
              </div>

              {/* Domain Count */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400">{batchStatus.processed_domains} / {batchStatus.total_domains} domains</span>
              </div>

              {/* Similar Companies Found (when completed) */}
              {isCompleted && batchStatus.similar_companies_found !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Similar companies found:</span>
                  <span className="text-white">{batchStatus.similar_companies_found}</span>
                </div>
              )}

              {/* Errors */}
              {batchStatus.errors !== undefined && batchStatus.errors > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-red-400">Errors: {batchStatus.errors}</span>
                </div>
              )}

              {/* Started Time */}
              <div className="pt-2 border-t border-gray-800">
                <span className="text-gray-500 text-sm">Started: {elapsedTime}</span>
              </div>

              {/* Action Buttons */}
              {isCompleted && (
                <div className="pt-4">
                  <Link
                    href="/enrichment"
                    className="inline-block px-6 py-3 bg-white text-black rounded font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Start New Batch
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-400">Loading batch status...</div>
          )}
        </section>
      </main>
    </div>
  );
}
