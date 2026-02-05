"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

interface CompanyCoverage {
  [key: string]: unknown;
}

const DEFAULT_VISIBLE_COUNT = 8;

export default function TestCompaniesDataGapsPage() {
  const [data, setData] = useState<CompanyCoverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Derive all column names from data (exclude the company identifier column)
  const { companyKey, allColumns } = useMemo(() => {
    if (data.length === 0) return { companyKey: "", allColumns: [] as string[] };
    const keys = Object.keys(data[0]);
    // First key is assumed to be the company identifier
    const cKey = keys[0];
    const cols = keys.slice(1);
    return { companyKey: cKey, allColumns: cols };
  }, [data]);

  // Initialize visible columns once data loads
  useEffect(() => {
    if (allColumns.length > 0 && !initialized) {
      setVisibleColumns(new Set(allColumns.slice(0, DEFAULT_VISIBLE_COUNT)));
      setInitialized(true);
    }
  }, [allColumns, initialized]);

  // Fetch data on mount
  useEffect(() => {
    if (!apiUrl) {
      setError("API URL not configured");
      setLoading(false);
      return;
    }

    fetch(`${apiUrl}/api/read/companies/coverage`, { method: "POST" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((responseData) => {
        // Adapt to response shape — handle array directly or nested under a key
        const rows = Array.isArray(responseData)
          ? responseData
          : responseData.data || responseData.companies || responseData.rows || [];
        setData(rows);
        setLoading(false);
      })
      .catch((err) => {
        setError(`Failed to load data: ${err.message}`);
        setLoading(false);
      });
  }, [apiUrl]);

  const toggleColumn = (col: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(col)) {
        next.delete(col);
      } else {
        next.add(col);
      }
      return next;
    });
  };

  const selectAll = () => setVisibleColumns(new Set(allColumns));
  const deselectAll = () => setVisibleColumns(new Set());

  const activeColumns = allColumns.filter((c) => visibleColumns.has(c));

  const isTruthy = (value: unknown): boolean => {
    if (value === null || value === undefined || value === false || value === 0 || value === "") return false;
    return true;
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 px-8 py-6">
        <Link
          href="/admin"
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
          Back to Admin
        </Link>

        <div className="flex items-center justify-between">
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
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </div>
            <div>
              <h1 className="text-white text-xl font-bold">Test Companies - Data Gaps</h1>
              <p className="text-gray-400 text-sm">
                Data coverage across {data.length > 0 ? `${data.length} test` : "test"} companies
              </p>
            </div>
          </div>

          {/* Columns button */}
          {!loading && !error && data.length > 0 && (
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors text-sm"
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
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
                <path d="M15 3v18" />
              </svg>
              Columns ({activeColumns.length}/{allColumns.length})
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="p-8">
        {loading ? (
          <p className="text-gray-400">Loading company coverage data...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : data.length === 0 ? (
          <p className="text-gray-400">No data returned from API.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="sticky left-0 z-10 bg-gray-900 px-4 py-3 text-left text-sm font-medium text-gray-400 border-r border-gray-800 min-w-[200px]">
                    {companyKey}
                  </th>
                  {activeColumns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-sm font-medium text-gray-400 bg-gray-900/80 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors"
                  >
                    <td className="sticky left-0 z-10 bg-gray-950 px-4 py-2.5 text-sm text-white font-medium border-r border-gray-800 whitespace-nowrap">
                      {String(row[companyKey] ?? "")}
                    </td>
                    {activeColumns.map((col) => (
                      <td key={col} className="px-4 py-2.5 text-center">
                        {isTruthy(row[col]) ? (
                          <span className="text-green-400 text-lg">&#10003;</span>
                        ) : (
                          <span className="text-red-400 text-lg">&#10007;</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Column picker drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Column picker drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-80 bg-gray-900 border-l border-gray-800 transform transition-transform duration-200 ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <h2 className="text-white font-semibold">Columns</h2>
          <button
            onClick={() => setDrawerOpen(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
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
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Select All / Deselect All */}
        <div className="flex gap-2 px-6 py-3 border-b border-gray-800">
          <button
            onClick={selectAll}
            className="px-3 py-1.5 rounded-lg text-sm bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
          >
            Select All
          </button>
          <button
            onClick={deselectAll}
            className="px-3 py-1.5 rounded-lg text-sm bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
          >
            Deselect All
          </button>
        </div>

        {/* Column toggles */}
        <div className="overflow-y-auto px-6 py-3" style={{ maxHeight: "calc(100vh - 130px)" }}>
          {allColumns.map((col) => (
            <label
              key={col}
              className="flex items-center justify-between py-2 cursor-pointer group"
            >
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors truncate mr-3">
                {col}
              </span>
              <button
                role="switch"
                aria-checked={visibleColumns.has(col)}
                onClick={() => toggleColumn(col)}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors ${
                  visibleColumns.has(col) ? "bg-blue-600" : "bg-gray-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform mt-0.5 ${
                    visibleColumns.has(col) ? "translate-x-4 ml-0.5" : "translate-x-0 ml-0.5"
                  }`}
                />
              </button>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
