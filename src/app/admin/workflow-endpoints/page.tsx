"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Workflow {
  workflow_slug: string;
  provider?: string;
  platform?: string;
  payload_type?: string;
  entity_type?: string;
  workflow_type?: string;
  description?: string;
  raw_table?: string | null;
  extracted_table?: string | null;
  core_table?: string | null;
  coalesces_to_core?: boolean;
  usage_category?: string;
  is_active?: boolean;
}

export default function WorkflowEndpointsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Filters based on API spec
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all");
  const [payloadTypeFilter, setPayloadTypeFilter] = useState<string>("all");
  const [workflowTypeFilter, setWorkflowTypeFilter] = useState<string>("all");
  const [usageCategoryFilter, setUsageCategoryFilter] = useState<string>("all");
  const [coalescesToCoreFilter, setCoalescesToCoreFilter] = useState<string>("all");
  const [isActiveFilter, setIsActiveFilter] = useState<string>("all");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Fetch workflows on mount
  useEffect(() => {
    if (!apiUrl) {
      setError("API URL not configured");
      setLoading(false);
      return;
    }

    fetch(`${apiUrl}/api/enrichment/workflows`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const workflowList = data.data || [];
        setWorkflows(workflowList);
        setLoading(false);
      })
      .catch((err) => {
        setError(`Failed to load workflows: ${err.message}`);
        setLoading(false);
      });
  }, [apiUrl]);

  // Get unique values for filter dropdowns
  const entityTypes = ["all", ...new Set(workflows.map((w) => w.entity_type).filter(Boolean))];
  const payloadTypes = ["all", ...new Set(workflows.map((w) => w.payload_type).filter(Boolean))];
  const workflowTypes = ["all", ...new Set(workflows.map((w) => w.workflow_type).filter(Boolean))];
  const usageCategories = ["all", ...new Set(workflows.map((w) => w.usage_category).filter(Boolean))];

  // Filter workflows
  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesEntityType = entityTypeFilter === "all" || workflow.entity_type === entityTypeFilter;
    const matchesPayloadType = payloadTypeFilter === "all" || workflow.payload_type === payloadTypeFilter;
    const matchesWorkflowType = workflowTypeFilter === "all" || workflow.workflow_type === workflowTypeFilter;
    const matchesUsageCategory = usageCategoryFilter === "all" || workflow.usage_category === usageCategoryFilter;
    const matchesCoalescesToCore = coalescesToCoreFilter === "all" ||
      (coalescesToCoreFilter === "true" && workflow.coalesces_to_core === true) ||
      (coalescesToCoreFilter === "false" && workflow.coalesces_to_core === false);
    const matchesIsActive = isActiveFilter === "all" ||
      (isActiveFilter === "true" && workflow.is_active === true) ||
      (isActiveFilter === "false" && workflow.is_active === false);

    return matchesEntityType && matchesPayloadType && matchesWorkflowType && matchesUsageCategory && matchesCoalescesToCore && matchesIsActive;
  });

  const toggleRow = (slug: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 px-8 py-6">
        <Link
          href="/admin"
          className="text-gray-400 text-sm hover:text-white mb-4 inline-flex items-center gap-2"
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
        <h1 className="text-white text-xl font-bold mt-4">View All Workflow Endpoints</h1>
        <p className="text-gray-400 text-sm mt-1">
          Browse and monitor all workflow API endpoints
        </p>
      </header>

      {/* Content */}
      <main className="p-8">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div>
            <label className="block text-gray-500 text-xs mb-1">Entity Type</label>
            <select
              value={entityTypeFilter}
              onChange={(e) => setEntityTypeFilter(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
            >
              {entityTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "all" ? "All" : type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-500 text-xs mb-1">Payload Type</label>
            <select
              value={payloadTypeFilter}
              onChange={(e) => setPayloadTypeFilter(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
            >
              {payloadTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "all" ? "All" : type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-500 text-xs mb-1">Workflow Type</label>
            <select
              value={workflowTypeFilter}
              onChange={(e) => setWorkflowTypeFilter(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
            >
              {workflowTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "all" ? "All" : type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-500 text-xs mb-1">Usage Category</label>
            <select
              value={usageCategoryFilter}
              onChange={(e) => setUsageCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
            >
              {usageCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All" : cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-500 text-xs mb-1">Coalesces to Core</label>
            <select
              value={coalescesToCoreFilter}
              onChange={(e) => setCoalescesToCoreFilter(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
            >
              <option value="all">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-500 text-xs mb-1">Active</label>
            <select
              value={isActiveFilter}
              onChange={(e) => setIsActiveFilter(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
            >
              <option value="all">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-gray-400 text-center py-12">Loading workflows...</div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-red-400 text-center py-12">{error}</div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredWorkflows.length === 0 && (
          <div className="text-gray-400 text-center py-12">
            {workflows.length === 0
              ? "No workflows found"
              : "No workflows match the selected filters"}
          </div>
        )}

        {/* Workflows Table */}
        {!loading && !error && filteredWorkflows.length > 0 && (
          <div className="rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="w-8"></th>
                  <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Workflow</th>
                  <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Entity</th>
                  <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Payload</th>
                  <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Usage</th>
                  <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Core</th>
                  <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Active</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkflows.map((workflow) => {
                  const isExpanded = expandedRows.has(workflow.workflow_slug);
                  return (
                    <>
                      <tr
                        key={workflow.workflow_slug}
                        onClick={() => toggleRow(workflow.workflow_slug)}
                        className="border-t border-gray-800 hover:bg-gray-900/30 transition-colors cursor-pointer"
                      >
                        <td className="pl-4">
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
                            className={`text-gray-500 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white font-medium">{workflow.workflow_slug}</div>
                          {workflow.description && (
                            <div className="text-gray-500 text-sm mt-1">{workflow.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-300">{workflow.entity_type || "-"}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-300">{workflow.payload_type || "-"}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-300">{workflow.usage_category || "-"}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={workflow.coalesces_to_core ? "text-green-400" : "text-gray-500"}>
                            {workflow.coalesces_to_core ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={workflow.is_active ? "text-green-400" : "text-red-400"}>
                            {workflow.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${workflow.workflow_slug}-details`} className="bg-gray-900/50">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Workflow Type:</span>
                                <span className="text-white ml-2">{workflow.workflow_type || "-"}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Provider:</span>
                                <span className="text-white ml-2">{workflow.provider || "-"}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Platform:</span>
                                <span className="text-white ml-2">{workflow.platform || "-"}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Raw Table:</span>
                                <span className="text-gray-300 ml-2 font-mono text-xs">{workflow.raw_table || "-"}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Extracted Table:</span>
                                <span className="text-gray-300 ml-2 font-mono text-xs">{workflow.extracted_table || "-"}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Core Table:</span>
                                <span className="text-gray-300 ml-2 font-mono text-xs">{workflow.core_table || "-"}</span>
                              </div>
                            </div>
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

        {/* Results Count */}
        {!loading && !error && workflows.length > 0 && (
          <div className="mt-4 text-gray-500 text-sm">
            Showing {filteredWorkflows.length} of {workflows.length} workflows
          </div>
        )}
      </main>
    </div>
  );
}
