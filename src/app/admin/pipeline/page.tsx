"use client";

import Link from "next/link";

interface PipelineRow {
  id: string;
  company: string;
  contact: string;
  organizer: string;
  stage: string;
  meetingDate: string;
  status: string;
  notes: string;
}

// Placeholder data - will be replaced with API data later
const mockData: PipelineRow[] = [
  {
    id: "1",
    company: "Acme Corp",
    contact: "John Smith",
    organizer: "Jane Doe",
    stage: "Discovery",
    meetingDate: "2024-02-15",
    status: "Scheduled",
    notes: "Initial call to discuss needs",
  },
  {
    id: "2",
    company: "TechStart Inc",
    contact: "Sarah Johnson",
    organizer: "Mike Wilson",
    stage: "Proposal",
    meetingDate: "2024-02-12",
    status: "Completed",
    notes: "Follow up on pricing discussion",
  },
  {
    id: "3",
    company: "Global Solutions",
    contact: "David Lee",
    organizer: "Jane Doe",
    stage: "Negotiation",
    meetingDate: "2024-02-18",
    status: "Pending",
    notes: "Contract review meeting",
  },
];

export default function PipelinePage() {
  const data = mockData;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 px-8 py-6">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/admin"
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
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
          </Link>
          <h1 className="text-white text-xl font-bold">Pipeline</h1>
        </div>
        <p className="text-gray-400 text-sm">
          Track meetings, outcomes, and offer generation
        </p>
      </header>

      {/* Content */}
      <main className="p-8">
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/80">
                  <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">
                    Company
                  </th>
                  <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">
                    Contact
                  </th>
                  <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">
                    Organizer
                  </th>
                  <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">
                    Stage
                  </th>
                  <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">
                    Meeting Date
                  </th>
                  <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">
                    Notes
                  </th>
                  <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">
                    Meeting Outcome
                  </th>
                  <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">
                    Offer Generation
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {data.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-white text-sm">
                      {row.company}
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-sm">
                      {row.contact}
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-sm">
                      {row.organizer}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {row.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-sm">
                      {row.meetingDate}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded border ${
                          row.status === "Completed"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : row.status === "Scheduled"
                              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm max-w-xs truncate">
                      {row.notes}
                    </td>
                    <td className="px-4 py-3">
                      <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors border border-gray-700">
                        Fill Form
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors border border-gray-700">
                        Generate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-400">No pipeline data available</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
