"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface PriorityCompany {
  id: string;
  company_name: string;
  domain: string | null;
  total: number;
  engineering: number;
  sales: number;
}

interface JobFunctionBreakdown {
  company_name: string;
  domain: string | null;
  total: number;
  by_job_function: {
    Sales: number;
    Engineering: number;
    "Business Development": number;
    Marketing: number;
    "Customer Success and Support": number;
    "Human Resources": number;
    "Product Management": number;
    Operations: number;
    Finance: number;
    Legal: number;
    Other: number;
  };
}

interface ExpandedState {
  loading: boolean;
  error: string | null;
  data: JobFunctionBreakdown | null;
}

interface CompanySuggestion {
  id: string | null;
  name: string | null;
  domain: string | null;
}

export default function PastEmployerGapsPage() {
  const [companies, setCompanies] = useState<PriorityCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [adding, setAdding] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, ExpandedState>>({});

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<CompanySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Fetch priority companies on mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  // Autocomplete search
  const searchCompanies = async (query: string) => {
    if (!apiUrl || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const res = await fetch(
        `${apiUrl}/api/companies/search?q=${encodeURIComponent(query)}&limit=10`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setSuggestions(json.data || []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleInputChange = (value: string) => {
    setNewCompanyName(value);
    setShowSuggestions(true);

    // Debounce search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      searchCompanies(value);
    }, 300);
  };

  const selectSuggestion = (suggestion: CompanySuggestion) => {
    setNewCompanyName(suggestion.name || "");
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const fetchCompanies = async () => {
    if (!apiUrl) {
      setError("API URL not configured");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/leads/priority-companies`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setCompanies(json.data || []);
      setLoading(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to load companies: ${message}`);
      setLoading(false);
    }
  };

  const addCompany = async () => {
    if (!apiUrl || !newCompanyName.trim()) return;

    setAdding(true);
    try {
      const res = await fetch(`${apiUrl}/api/leads/priority-companies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: newCompanyName.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const newCompany = await res.json();
      setCompanies((prev) => [...prev, newCompany]);
      setNewCompanyName("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      alert(`Failed to add company: ${message}`);
    } finally {
      setAdding(false);
    }
  };

  const deleteCompany = async (companyName: string) => {
    if (!apiUrl) return;

    try {
      const res = await fetch(
        `${apiUrl}/api/leads/priority-companies/${encodeURIComponent(companyName)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setCompanies((prev) => prev.filter((c) => c.company_name !== companyName));
      // Clean up expanded state
      setExpandedRows((prev) => {
        const next = { ...prev };
        delete next[companyName];
        return next;
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      alert(`Failed to delete company: ${message}`);
    }
  };

  const toggleExpand = async (companyName: string) => {
    const current = expandedRows[companyName];

    // If already expanded, collapse
    if (current?.data) {
      setExpandedRows((prev) => {
        const next = { ...prev };
        delete next[companyName];
        return next;
      });
      return;
    }

    // Expand and fetch breakdown
    setExpandedRows((prev) => ({
      ...prev,
      [companyName]: { loading: true, error: null, data: null },
    }));

    try {
      const res = await fetch(
        `${apiUrl}/api/leads/past-employer-breakdown?company_name=${encodeURIComponent(companyName)}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: JobFunctionBreakdown = await res.json();
      setExpandedRows((prev) => ({
        ...prev,
        [companyName]: { loading: false, error: null, data },
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setExpandedRows((prev) => ({
        ...prev,
        [companyName]: { loading: false, error: message, data: null },
      }));
    }
  };

  const jobFunctionOrder = [
    "Sales",
    "Business Development",
    "Engineering",
    "Marketing",
    "Customer Success and Support",
    "Human Resources",
    "Product Management",
    "Operations",
    "Finance",
    "Legal",
    "Other",
  ] as const;

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
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">Past Employer Gaps and Stats</h1>
            <p className="text-gray-400 text-sm">
              Track target companies and alumni counts by job function
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-8 max-w-5xl">
        {/* Add Company Input */}
        <div className="mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={newCompanyName}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setShowSuggestions(false);
                    addCompany();
                  } else if (e.key === "Escape") {
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Enter company name..."
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
              />
              {/* Autocomplete dropdown */}
              {showSuggestions && (suggestions.length > 0 || loadingSuggestions) && (
                <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {loadingSuggestions ? (
                    <div className="px-4 py-2 text-gray-500 text-sm">Searching...</div>
                  ) : (
                    suggestions.map((suggestion, idx) => (
                      <button
                        key={suggestion.id || idx}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectSuggestion(suggestion)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-800 transition-colors flex items-center justify-between"
                      >
                        <span className="text-white">{suggestion.name}</span>
                        {suggestion.domain && (
                          <span className="text-gray-500 text-sm">{suggestion.domain}</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <button
              onClick={addCompany}
              disabled={adding || !newCompanyName.trim()}
              className="px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? "Adding..." : "Add"}
            </button>
          </div>
        </div>

        {/* Companies Table */}
        {loading ? (
          <p className="text-gray-400">Loading companies...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : companies.length === 0 ? (
          <p className="text-gray-500">No priority companies added yet.</p>
        ) : (
          <div className="rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/50">
                  <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">
                    Company
                  </th>
                  <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">
                    Domain
                  </th>
                  <th className="text-right text-gray-400 text-sm font-medium px-4 py-3">
                    Total
                  </th>
                  <th className="text-right text-gray-400 text-sm font-medium px-4 py-3">
                    Engineering
                  </th>
                  <th className="text-right text-gray-400 text-sm font-medium px-4 py-3">
                    Sales
                  </th>
                  <th className="text-right text-gray-400 text-sm font-medium px-4 py-3 w-16">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => {
                  const expanded = expandedRows[company.company_name];
                  const isExpanded = !!expanded;

                  return (
                    <>
                      <tr
                        key={company.id}
                        onClick={() => toggleExpand(company.company_name)}
                        className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
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
                              className={`text-gray-500 transition-transform ${
                                isExpanded ? "rotate-90" : ""
                              }`}
                            >
                              <path d="m9 18 6-6-6-6" />
                            </svg>
                            <span className="text-white font-medium">
                              {company.company_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {company.domain || "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-white font-medium">
                          {company.total.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-300">
                          {company.engineering.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-300">
                          {company.sales.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCompany(company.company_name);
                            }}
                            className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                            title="Delete company"
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
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Detail Row */}
                      {isExpanded && (
                        <tr key={`${company.id}-expanded`} className="bg-gray-900/30">
                          <td colSpan={6} className="px-4 py-4">
                            {expanded.loading ? (
                              <p className="text-gray-500 text-sm">Loading breakdown...</p>
                            ) : expanded.error ? (
                              <p className="text-red-400 text-sm">
                                Error: {expanded.error}
                              </p>
                            ) : expanded.data ? (
                              <div className="pl-6">
                                <p className="text-gray-400 text-sm mb-3">
                                  Job Function Breakdown
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                  {jobFunctionOrder.map((func) => {
                                    const count =
                                      expanded.data!.by_job_function[func] || 0;
                                    return (
                                      <div
                                        key={func}
                                        className="bg-gray-800/50 rounded-lg px-3 py-2"
                                      >
                                        <p className="text-gray-400 text-xs">{func}</p>
                                        <p className="text-white font-medium">
                                          {count.toLocaleString()}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
