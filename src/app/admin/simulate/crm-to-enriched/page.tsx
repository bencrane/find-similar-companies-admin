"use client";

import Link from "next/link";
import { useState, useRef, useCallback } from "react";
import Papa from "papaparse";

export default function CrmToEnrichedPage() {
  const [selectedClient, setSelectedClient] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [csvData, setCsvData] = useState<Record<string, string>[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TODO: Replace with actual API endpoint
  const clients: { id: string; name: string }[] = [];

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) {
      setParseError("Please upload a CSV file");
      return;
    }

    setParseError(null);
    setFileName(file.name);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setParseError(`Parse error: ${results.errors[0].message}`);
          return;
        }
        setCsvData(results.data);
      },
      error: (error) => {
        setParseError(`Failed to parse CSV: ${error.message}`);
      },
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const clearFile = () => {
    setCsvData(null);
    setFileName(null);
    setParseError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 px-8 py-6">
        <Link
          href="/admin/simulate"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back to Simulate
        </Link>

        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-gray-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">From CRM Work Emails to Fully Enriched</h1>
            <p className="text-gray-400 text-sm">Enrich raw CRM work emails into full company and contact profiles</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Import Client CRM CSV Card */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <div className="flex items-start gap-3 mb-6">
              <div className="p-3 rounded-lg bg-gray-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" x2="12" y1="3" y2="15" />
                </svg>
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Import Client CRM CSV</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Select a client and upload their CRM export
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="client-select" className="block text-sm text-gray-400 mb-2">
                  Select Client
                </label>
                <select
                  id="client-select"
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gray-600 transition-colors"
                >
                  <option value="">Select a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Drop Zone */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Upload CSV</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  className="hidden"
                />
                {!csvData ? (
                  <div
                    onClick={handleDropZoneClick}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragging
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-500 mx-auto mb-3"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" x2="12" y1="3" y2="15" />
                    </svg>
                    <p className="text-gray-400 text-sm">
                      Drag and drop a CSV file here, or click to browse
                    </p>
                  </div>
                ) : (
                  <div className="border border-gray-700 rounded-lg p-4 bg-gray-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-green-500"
                        >
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <div>
                          <p className="text-white text-sm font-medium">{fileName}</p>
                          <p className="text-gray-400 text-xs">{csvData.length} rows parsed</p>
                        </div>
                      </div>
                      <button
                        onClick={clearFile}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" x2="6" y1="6" y2="18" />
                          <line x1="6" x2="18" y1="6" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                {parseError && (
                  <p className="text-red-400 text-sm mt-2">{parseError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Kickoff Enrichment Pipeline Card */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <div className="flex items-start gap-3 mb-6">
              <div className="p-3 rounded-lg bg-gray-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Kickoff Enrichment Pipeline</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Start the enrichment process for imported data
                </p>
              </div>
            </div>

            <button
              disabled
              className="w-full bg-gray-800 text-gray-500 rounded-lg px-4 py-2.5 font-medium cursor-not-allowed"
            >
              Start Enrichment
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
