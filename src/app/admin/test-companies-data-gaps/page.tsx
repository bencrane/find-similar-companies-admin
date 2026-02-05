"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

interface CompanyCoverage {
  [key: string]: unknown;
}

const TIER_ORDER: { label: string; columns: string[] }[] = [
  {
    label: "Tier 1 - Must Have",
    columns: [
      "core.companies",
      "core.company_names",
      "core.company_types",
      "core.company_descriptions",
      "core.company_social_urls",
      "core.company_employee_range",
      "core.company_employee_ranges",
      "core.company_industries",
      "core.company_customers",
      "icp_industry",
      "icp_details",
      "icp_job_title",
    ],
  },
  {
    label: "Tier 2 - High Value for Outreach",
    columns: [
      "core.company_google_ads",
      "core.company_linkedin_ads",
      "core.company_meta_ads",
      "core.company_custom_pricing_mentioned",
      "core.company_comparison_pages",
      "core.company_job_postings",
    ],
  },
  {
    label: "Tier 3 - Enrichment / Context",
    columns: [
      "core.company_similar_companies_preview",
      "core.company_categories",
      "core.company_funding",
      "core.company_funding_rounds",
      "core.company_vc_backed",
      "core.company_revenue",
      "core.company_pricing_model",
      "core.company_business_model",
      "core.company_sales_motion",
      "core.company_tech_on_site",
      "core.company_locations",
    ],
  },
  {
    label: "Tier 4 - Pricing Page Details",
    columns: [
      "core.company_annual_commitment_required",
      "core.company_billing_default",
      "core.company_minimum_seats",
      "core.company_number_of_tiers",
      "core.company_free_trial",
      "core.company_money_back_guarantee",
      "core.company_enterprise_tier_exists",
      "core.company_pricing_visibility",
    ],
  },
];

const TIERED_COLUMNS = TIER_ORDER.flatMap((t) => t.columns);
const CACHE_KEY = "test-companies-coverage-cache";
const TIER_LAYOUT_KEY = "test-companies-tier-layout";

export default function TestCompaniesDataGapsPage() {
  const [data, setData] = useState<CompanyCoverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cachedAt, setCachedAt] = useState<string | null>(null);

  const [tieredGroups, setTieredGroups] = useState<{ label: string; columns: string[] }[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Build tier groups once data loads (respects saved layout from localStorage)
  useEffect(() => {
    if (data.length === 0) return;
    const coverage = data[0].coverage;
    if (!coverage || typeof coverage !== "object") return;

    const apiKeys = new Set(Object.keys(coverage as Record<string, unknown>));

    // Try to load saved layout
    try {
      const saved = localStorage.getItem(TIER_LAYOUT_KEY);
      if (saved) {
        const savedGroups: { label: string; columns: string[] }[] = JSON.parse(saved);
        // Filter to only columns that still exist in the API, and add any new ones to Tier 5
        const savedColumnSet = new Set(savedGroups.flatMap((g) => g.columns));
        const groups = savedGroups.map((g) => ({
          label: g.label,
          columns: g.columns.filter((c) => apiKeys.has(c)),
        }));
        const newCols = [...apiKeys].filter((k) => !savedColumnSet.has(k));
        if (newCols.length > 0) {
          const t5 = groups.find((g) => g.label.startsWith("Tier 5"));
          if (t5) {
            t5.columns.push(...newCols);
          } else {
            groups.push({ label: "Tier 5 - Metadata / Low Priority", columns: newCols });
          }
        }
        setTieredGroups(groups);
        return;
      }
    } catch {}

    // Default layout from TIER_ORDER
    const groups = TIER_ORDER.map((tier) => ({
      label: tier.label,
      columns: tier.columns.filter((c) => apiKeys.has(c)),
    }));
    const remaining = [...apiKeys].filter((k) => !TIERED_COLUMNS.includes(k));
    if (remaining.length > 0) {
      groups.push({ label: "Tier 5 - Metadata / Low Priority", columns: remaining });
    }
    setTieredGroups(groups);
  }, [data]);

  const allColumns = useMemo(() => tieredGroups.flatMap((g) => g.columns), [tieredGroups]);

  // Initialize visible columns once data loads — default to Tier 1 + 2
  useEffect(() => {
    if (tieredGroups.length > 0 && !initialized) {
      const defaults = [
        ...tieredGroups[0]?.columns ?? [],
        ...tieredGroups[1]?.columns ?? [],
      ];
      setVisibleColumns(new Set(defaults));
      setInitialized(true);
    }
  }, [tieredGroups, initialized]);

  const fetchFromApi = async () => {
    if (!apiUrl) {
      setError("API URL not configured");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${apiUrl}/read/companies/coverage`, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const responseData = await res.json();
      const rows = Array.isArray(responseData)
        ? responseData
        : responseData.data || responseData.companies || responseData.rows || [];
      const timestamp = new Date().toISOString();
      localStorage.setItem(CACHE_KEY, JSON.stringify({ rows, cachedAt: timestamp }));
      setData(rows);
      setCachedAt(timestamp);
    } catch (err: unknown) {
      setError(`Failed to load data: ${err instanceof Error ? err.message : err}`);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    await fetchFromApi();
    setRefreshing(false);
  };

  // Load from cache on mount, fall back to API
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { rows, cachedAt: ts } = JSON.parse(cached);
        setData(rows);
        setCachedAt(ts);
        setLoading(false);
        return;
      }
    } catch {}
    fetchFromApi().finally(() => setLoading(false));
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

  // Move a column up or down across the flat list (crosses tier boundaries)
  const moveColumn = (col: string, direction: "up" | "down") => {
    setTieredGroups((prev) => {
      // Find which tier and index the column is in
      let tierIdx = -1;
      let colIdx = -1;
      for (let t = 0; t < prev.length; t++) {
        const ci = prev[t].columns.indexOf(col);
        if (ci !== -1) {
          tierIdx = t;
          colIdx = ci;
          break;
        }
      }
      if (tierIdx === -1) return prev;

      const groups = prev.map((g) => ({ ...g, columns: [...g.columns] }));

      if (direction === "up") {
        if (colIdx > 0) {
          // Move up within same tier
          [groups[tierIdx].columns[colIdx - 1], groups[tierIdx].columns[colIdx]] =
            [groups[tierIdx].columns[colIdx], groups[tierIdx].columns[colIdx - 1]];
        } else if (tierIdx > 0) {
          // Move to end of previous tier
          groups[tierIdx].columns.splice(colIdx, 1);
          groups[tierIdx - 1].columns.push(col);
        }
      } else {
        if (colIdx < groups[tierIdx].columns.length - 1) {
          // Move down within same tier
          [groups[tierIdx].columns[colIdx], groups[tierIdx].columns[colIdx + 1]] =
            [groups[tierIdx].columns[colIdx + 1], groups[tierIdx].columns[colIdx]];
        } else if (tierIdx < groups.length - 1) {
          // Move to start of next tier
          groups[tierIdx].columns.splice(colIdx, 1);
          groups[tierIdx + 1].columns.unshift(col);
        }
      }

      localStorage.setItem(TIER_LAYOUT_KEY, JSON.stringify(groups));
      return groups;
    });
  };

  const toggleTier = (tierColumns: string[]) => {
    setVisibleColumns((prev) => {
      const allOn = tierColumns.every((c) => prev.has(c));
      const next = new Set(prev);
      tierColumns.forEach((c) => (allOn ? next.delete(c) : next.add(c)));
      return next;
    });
  };

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

          <div className="flex items-center gap-3">
            {cachedAt && (
              <span className="text-gray-600 text-xs">
                Cached: {new Date(cachedAt).toLocaleString()}
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors text-sm disabled:opacity-50"
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
                className={refreshing ? "animate-spin" : ""}
              >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </button>
            {!loading && !error && data.length > 0 && (
              <button
                onClick={() => setDrawerOpen(!drawerOpen)}
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
        </div>
      </header>

      {/* Content */}
      <div className="flex">
        {/* Column picker sidebar */}
        {drawerOpen && (
          <aside className="w-80 flex-shrink-0 border-r border-gray-800 bg-gray-900 h-[calc(100vh-120px)] sticky top-0">
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

            {/* Column toggles grouped by tier */}
            <div className="overflow-y-auto px-6 py-3" style={{ maxHeight: "calc(100vh - 250px)" }}>
              {tieredGroups.map((tier) => {
                if (tier.columns.length === 0) return null;
                const allOn = tier.columns.every((c) => visibleColumns.has(c));
                return (
                  <div key={tier.label} className="mb-4">
                    <button
                      onClick={() => toggleTier(tier.columns)}
                      className="flex items-center justify-between w-full mb-1"
                    >
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {tier.label}
                      </span>
                      <span className={`text-xs ${allOn ? "text-blue-400" : "text-gray-600"}`}>
                        {allOn ? "hide all" : "show all"}
                      </span>
                    </button>
                    {tier.columns.map((col) => (
                      <div
                        key={col}
                        className="flex items-center justify-between py-1.5 group"
                      >
                        {/* Up/Down arrows */}
                        <div className="flex flex-col mr-1.5">
                          <button
                            onClick={() => moveColumn(col, "up")}
                            className="text-gray-600 hover:text-white transition-colors leading-none"
                            title="Move up"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                          </button>
                          <button
                            onClick={() => moveColumn(col, "down")}
                            className="text-gray-600 hover:text-white transition-colors leading-none"
                            title="Move down"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                          </button>
                        </div>
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors truncate mr-auto">
                          {col}
                        </span>
                        <button
                          role="switch"
                          aria-checked={visibleColumns.has(col)}
                          onClick={() => toggleColumn(col)}
                          className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors ml-2 ${
                            visibleColumns.has(col) ? "bg-blue-600" : "bg-gray-700"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform mt-0.5 ${
                              visibleColumns.has(col) ? "translate-x-4 ml-0.5" : "translate-x-0 ml-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 p-8">
          {loading ? (
            <p className="text-gray-400">Loading company coverage data...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : data.length === 0 ? (
            <p className="text-gray-400">No data returned from API.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-800">
              <table className="border-collapse">
                <thead>
                  {/* Tier group header row */}
                  <tr className="border-b border-gray-800">
                    <th className="sticky left-0 z-10 bg-gray-900 border-r border-gray-800" />
                    {tieredGroups.map((tier) => {
                      const visibleInTier = tier.columns.filter((c) => visibleColumns.has(c));
                      if (visibleInTier.length === 0) return null;
                      return (
                        <th
                          key={tier.label}
                          colSpan={visibleInTier.length}
                          className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-900/80 border-l border-gray-700"
                        >
                          {tier.label}
                        </th>
                      );
                    })}
                  </tr>
                  {/* Column name row */}
                  <tr className="border-b border-gray-800">
                    <th className="sticky left-0 z-10 bg-gray-900 px-3 py-3 text-left text-sm font-medium text-gray-400 border-r border-gray-800">
                      domain
                    </th>
                    {activeColumns.map((col) => (
                      <th
                        key={col}
                        className="px-3 py-3 text-left text-sm font-medium text-gray-400 bg-gray-900/80 whitespace-nowrap"
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
                      <td className="sticky left-0 z-10 bg-gray-950 px-3 py-2 text-sm text-white font-medium border-r border-gray-800 whitespace-nowrap">
                        {String(row.domain ?? "")}
                      </td>
                      {activeColumns.map((col) => (
                        <td key={col} className="px-3 py-2 text-center">
                          {isTruthy((row.coverage as Record<string, unknown>)?.[col]) ? (
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
      </div>
    </div>
  );
}
