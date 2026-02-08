"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

interface PipelineRow {
  deal_id: string;
  deal_status: string;
  stage: string;
  notes: string | null;
  value: number | null;
  payment_type: string | null;
  organizer_email: string | null;
  deal_created_at: string;
  company_id: string;
  company_name: string;
  company_domain: string;
  contact_id: string;
  contact_name: string;
  contact_email: string;
  booking_id: string | null;
  meeting_title: string | null;
  meeting_date: string | null;
  meeting_attended: boolean | null;
  booking_status: string | null;
}

const ORGANIZER_MAP: Record<string, string> = {
  "revenueengineer.com": "RevenueEngineer.com",
  "outboundsolutions.com": "Outbound Solutions",
  "revenueactivation.io": "Revenue Activation",
};

const ORGANIZERS = ["RevenueEngineer.com", "Outbound Solutions", "Revenue Activation"] as const;
type OrganizerFilter = (typeof ORGANIZERS)[number] | "All";

function getOrganizerDisplay(email: string | null): string {
  if (!email) return "—";
  const domain = email.split("@")[1];
  return ORGANIZER_MAP[domain] || domain;
}

function formatMeetingDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getStageColor(stage: string): string {
  switch (stage) {
    case "met":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "booked":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "proposal":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "negotiation":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "closed_won":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "closed_lost":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "active":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "won":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "lost":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "stale":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

export default function PipelinePage() {
  const [data, setData] = useState<PipelineRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizerFilter, setOrganizerFilter] = useState<OrganizerFilter>("All");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("https://api.revenueinfra.com/api/pipeline/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const result = await response.json();
      setData(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pipeline data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Listen for refresh events (when forms are submitted in other tabs)
  useEffect(() => {
    const handleFocus = () => {
      fetchData();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchData]);

  const filteredData =
    organizerFilter === "All"
      ? data
      : data.filter((row) => getOrganizerDisplay(row.organizer_email) === organizerFilter);

  const openMeetingOutcome = (dealId: string) => {
    window.open(`/admin/pipeline/meeting-outcome?deal_id=${dealId}`, "_blank");
  };

  const openOfferGeneration = (dealId: string) => {
    window.open(`/admin/pipeline/offer?deal_id=${dealId}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-gray-800 px-8 py-6">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
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
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
          </Link>
          <h1 className="text-white text-xl font-bold">Pipeline</h1>
        </div>
        <p className="text-gray-400 text-sm">Track meetings, outcomes, and offer generation</p>
      </header>

      <main className="p-8">
        {/* Filter */}
        <div className="mb-6 flex items-center gap-4">
          <label className="text-gray-400 text-sm">Filter by Organizer:</label>
          <select
            value={organizerFilter}
            onChange={(e) => setOrganizerFilter(e.target.value as OrganizerFilter)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-gray-600 transition-colors"
          >
            <option value="All">All</option>
            {ORGANIZERS.map((org) => (
              <option key={org} value={org}>
                {org}
              </option>
            ))}
          </select>
          <button
            onClick={fetchData}
            className="ml-auto px-4 py-2 text-sm font-medium rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors border border-gray-700"
          >
            Refresh
          </button>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-400">Loading pipeline data...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-400">{error}</p>
              <button
                onClick={fetchData}
                className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors border border-gray-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900/80">
                    <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Company</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Contact</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Organizer</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Stage</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Meeting Date</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Status</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Notes</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Meeting Outcome</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Proposal Generation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredData.map((row) => (
                    <tr key={row.deal_id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3 text-white text-sm">{row.company_name}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm">{row.contact_name}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm">
                        {getOrganizerDisplay(row.organizer_email)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded border ${getStageColor(row.stage)}`}
                        >
                          {row.stage}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">
                        {formatMeetingDate(row.meeting_date)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(row.deal_status)}`}
                        >
                          {row.deal_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm max-w-xs truncate">
                        {row.notes || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openMeetingOutcome(row.deal_id)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors border border-gray-700"
                        >
                          Fill Form
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openOfferGeneration(row.deal_id)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors border border-gray-700"
                        >
                          Fill Form
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && filteredData.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-400">No pipeline data available</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
