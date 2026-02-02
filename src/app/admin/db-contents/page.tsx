"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface SchemaInfo {
  schema: string;
  tables: string[];
}

interface QueryRow {
  id: number;
  schema: string;
  table: string;
  count: number | null;
  loading: boolean;
  error: string | null;
}

interface WhereQueryRow {
  id: number;
  condition: string;
  count: number | null;
  loading: boolean;
  error: string | null;
}

// Custom dropdown for tables with green asterisk support
function TableDropdown({
  tables,
  value,
  onChange,
  schema,
}: {
  tables: string[];
  value: string;
  onChange: (v: string) => void;
  schema: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const hasApi = (t: string) => TABLES_WITH_ENDPOINTS.has(`${schema}.${t}`);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm text-left min-w-[140px] flex items-center justify-between gap-2"
      >
        <span>
          {value ? (
            <>
              {hasApi(value) ? <span className="text-green-400">*</span> : <span className="text-red-400">*</span>}
              {value}
            </>
          ) : (
            <span className="text-gray-400">table...</span>
          )}
        </span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-80 max-h-[70vh] overflow-auto bg-gray-800 border border-gray-700 rounded shadow-lg">
          <div
            className="px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-700 cursor-pointer"
            onClick={() => { onChange(""); setOpen(false); }}
          >
            table...
          </div>
          {tables.map(t => (
            <div
              key={t}
              className="px-3 py-1.5 text-sm text-white hover:bg-gray-700 cursor-pointer"
              onClick={() => { onChange(t); setOpen(false); }}
            >
              {hasApi(t) ? <span className="text-green-400">*</span> : <span className="text-red-400">*</span>}{t}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Tables with dedicated API endpoints (green asterisk)
const TABLES_WITH_ENDPOINTS = new Set([
  // core schema
  "core.companies",
  "core.people",
  "core.company_customers",
  "core.person_work_history",
  "core.person_past_employer",
  "core.company_descriptions",
  "core.company_industries",
  "core.company_locations",
  "core.company_employee_range",
  "core.company_employee_ranges",
  "core.company_funding",
  "core.company_revenue",
  "core.company_linkedin_urls",
  "core.person_locations",
  "core.person_job_titles",
  "core.person_tenure",
  "core.person_promotions",
  "core.person_job_start_dates",
  "core.company_vc_backed",
  "core.company_vc_investments",
  "core.company_vc_investors",
  "core.case_study_champions",
  "core.icp_criteria",
  "core.companies_missing_cleaned_name",
  "core.companies_missing_location",
  "core.people_missing_country",
  "core.persons_missing_cleaned_title",
  "core.company_people_snapshot_history",
  "core.company_public",
  "core.target_client_views",
  // extracted schema
  "extracted.company_discovery",
]);

// Legacy mapping for specific endpoints (used for "Show me 10 records" feature)
const API_ENDPOINTS: Record<string, { endpoint: string; countKey: string; recordsKey: string; columns: string[] }> = {
  "core.people": { endpoint: "/api/leads", countKey: "meta.total", recordsKey: "data", columns: ["full_name", "title", "company_name", "linkedin_url"] },
  "core.companies": { endpoint: "/api/companies", countKey: "meta.total", recordsKey: "data", columns: ["name", "domain", "industry", "employee_range"] },
};

// Where conditions with API endpoints (gap detection queries)
const WHERE_CONDITIONS: Record<string, { label: string; endpoint: string; countKey: string }> = {
  "pending-enrichment": { label: "companies pending similar-company enrichment", endpoint: "/api/enrichment/similar-companies/pending", countKey: "total" },
  "companies-missing-cleaned-name": { label: "companies missing cleaned name", endpoint: "/api/admin/core/companies_missing_cleaned_name/count", countKey: "count" },
  "companies-missing-location": { label: "companies missing location", endpoint: "/api/admin/core/companies_missing_location/count", countKey: "count" },
  "people-missing-country": { label: "people missing country", endpoint: "/api/admin/core/people_missing_country/count", countKey: "count" },
  "people-missing-cleaned-title": { label: "people missing cleaned title", endpoint: "/api/admin/core/persons_missing_cleaned_title/count", countKey: "count" },
};

// Schemas to show (filter out system schemas)
const VISIBLE_SCHEMAS = ["core", "extracted", "raw", "reference", "derived", "mapped", "staging", "manual", "temp"];

let nextId = 1;

export default function DBContentsPage() {
  const [schemas, setSchemas] = useState<SchemaInfo[]>([]);
  const [queries, setQueries] = useState<QueryRow[]>([
    { id: nextId++, schema: "", table: "", count: null, loading: false, error: null }
  ]);
  const [whereQueries, setWhereQueries] = useState<WhereQueryRow[]>([
    { id: nextId++, condition: "", count: null, loading: false, error: null }
  ]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Load schema info on mount
  useEffect(() => {
    fetch("/data/schema.json")
      .then(res => res.json())
      .then((data: SchemaInfo[]) => {
        const filtered = data.filter(s => VISIBLE_SCHEMAS.includes(s.schema));
        setSchemas(filtered);
      })
      .catch(err => console.error("Failed to load schema:", err));
  }, []);

  // Table queries
  const updateQuery = (id: number, updates: Partial<QueryRow>) => {
    setQueries(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const addQuery = () => {
    setQueries(prev => [...prev, { id: nextId++, schema: "", table: "", count: null, loading: false, error: null }]);
  };

  const removeQuery = (id: number) => {
    if (queries.length > 1) {
      setQueries(prev => prev.filter(q => q.id !== id));
    }
  };

  const runQuery = async (id: number) => {
    const query = queries.find(q => q.id === id);
    if (!query || !query.schema || !query.table) return;

    if (!apiUrl) {
      updateQuery(id, { error: "API URL not configured", loading: false });
      return;
    }

    updateQuery(id, { loading: true, error: null, count: null });

    try {
      // Use generic admin endpoint for count
      const res = await fetch(`${apiUrl}/api/admin/tables/${query.schema}/${query.table}/count`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const count = data.count ?? 0;

      updateQuery(id, { count, loading: false });
    } catch (err) {
      updateQuery(id, { error: `Failed: ${err}`, loading: false });
    }
  };

  // Where queries
  const updateWhereQuery = (id: number, updates: Partial<WhereQueryRow>) => {
    setWhereQueries(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const addWhereQuery = () => {
    setWhereQueries(prev => [...prev, { id: nextId++, condition: "", count: null, loading: false, error: null }]);
  };

  const removeWhereQuery = (id: number) => {
    if (whereQueries.length > 1) {
      setWhereQueries(prev => prev.filter(q => q.id !== id));
    }
  };

  const runWhereQuery = async (id: number) => {
    const query = whereQueries.find(q => q.id === id);
    if (!query || !query.condition) return;

    const config = WHERE_CONDITIONS[query.condition];
    if (!config) {
      updateWhereQuery(id, { error: "No API endpoint", loading: false });
      return;
    }

    if (!apiUrl) {
      updateWhereQuery(id, { error: "API URL not configured", loading: false });
      return;
    }

    updateWhereQuery(id, { loading: true, error: null, count: null });

    try {
      const res = await fetch(`${apiUrl}${config.endpoint}?limit=1`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const count = data[config.countKey] ?? 0;

      updateWhereQuery(id, { count, loading: false });
    } catch (err) {
      updateWhereQuery(id, { error: `Failed: ${err}`, loading: false });
    }
  };

  const getTables = (schemaName: string) => {
    return schemas.find(s => s.schema === schemaName)?.tables || [];
  };

  const formatNumber = (num: number | null) => {
    if (num === null) return null;
    return num.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 px-8 py-6">
        <Link href="/admin" className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors">
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
          <span className="font-semibold">View DB Contents</span>
        </Link>
      </header>

      {/* Content */}
      <main className="p-8 max-w-5xl space-y-8">

        {/* Section: Show me the # of records in */}
        <section>
          <div className="mb-3 pb-2 border-b border-gray-800">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Show me the # of records in...</h2>
          </div>

          <div className="space-y-3">
            {queries.map((query) => {
              const canRun = query.schema && query.table;

              return (
                <div key={query.id} className="p-4 rounded-xl border border-gray-800 bg-gray-900/50">
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={query.schema}
                      onChange={(e) => updateQuery(query.id, { schema: e.target.value, table: "", count: null, error: null })}
                      className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                    >
                      <option value="">schema...</option>
                      {schemas.map(s => (
                        <option key={s.schema} value={s.schema}>{s.schema}</option>
                      ))}
                    </select>

                    {query.schema && (
                      <>
                        <span className="text-gray-500">.</span>
                        <TableDropdown
                          tables={getTables(query.schema)}
                          value={query.table}
                          onChange={(t) => updateQuery(query.id, { table: t, count: null, error: null })}
                          schema={query.schema}
                        />
                      </>
                    )}

                    {query.schema && query.table && (
                      <button
                        onClick={() => runQuery(query.id)}
                        disabled={query.loading || !canRun}
                        className="px-4 py-2 bg-white text-black rounded font-medium text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {query.loading ? "..." : "Go"}
                      </button>
                    )}

                    {query.count !== null && (
                      <span className="text-2xl font-bold text-white ml-2">
                        {formatNumber(query.count)}
                      </span>
                    )}

                    {query.error && (
                      <span className="text-red-400 text-sm ml-2">{query.error}</span>
                    )}

                    {queries.length > 1 && (
                      <button
                        onClick={() => removeQuery(query.id)}
                        className="ml-auto text-gray-500 hover:text-red-400 transition-colors"
                        title="Remove"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            <button
              onClick={addQuery}
              className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-white transition-colors text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add query
            </button>
          </div>
        </section>

        {/* Section: Show me the # of records where */}
        <section>
          <div className="mb-3 pb-2 border-b border-gray-800">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Show me the # of records where...</h2>
          </div>

          <div className="space-y-3">
            {whereQueries.map((query) => {
              const hasEndpoint = query.condition && WHERE_CONDITIONS[query.condition];
              const canRun = query.condition && hasEndpoint;

              return (
                <div key={query.id} className="p-4 rounded-xl border border-gray-800 bg-gray-900/50">
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={query.condition}
                      onChange={(e) => updateWhereQuery(query.id, { condition: e.target.value, count: null, error: null })}
                      className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                    >
                      <option value="">condition...</option>
                      {Object.entries(WHERE_CONDITIONS).map(([key, config]) => (
                        <option key={key} value={key}>* {config.label}</option>
                      ))}
                    </select>

                    {query.condition && (
                      <button
                        onClick={() => runWhereQuery(query.id)}
                        disabled={query.loading || !canRun}
                        className="px-4 py-2 bg-white text-black rounded font-medium text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {query.loading ? "..." : "Go"}
                      </button>
                    )}

                    {query.count !== null && (
                      <span className="text-2xl font-bold text-white ml-2">
                        {formatNumber(query.count)}
                      </span>
                    )}

                    {query.error && (
                      <span className="text-red-400 text-sm ml-2">{query.error}</span>
                    )}

                    {whereQueries.length > 1 && (
                      <button
                        onClick={() => removeWhereQuery(query.id)}
                        className="ml-auto text-gray-500 hover:text-red-400 transition-colors"
                        title="Remove"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            <button
              onClick={addWhereQuery}
              className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-white transition-colors text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add query
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}
