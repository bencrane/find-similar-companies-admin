import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 px-8 py-6">
        <h1 className="text-white text-xl font-bold">Admin</h1>
        <p className="text-gray-400 text-sm mt-1">Internal Admin Dashboard</p>
      </header>

      {/* Content */}
      <main className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/data-ingest" className="block">
          <div className="h-full rounded-xl border border-gray-800 bg-gray-900/50 p-6 cursor-pointer hover:border-gray-700 transition-colors">
            <div className="flex items-start justify-between mb-6">
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
                className="text-gray-500"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-white font-semibold text-lg">Data Ingest</h2>
            <p className="text-gray-400 text-sm mt-2">
              Upload and process data for enrichment workflows
            </p>
          </div>
        </Link>

        <Link href="/admin/db-contents" className="block">
          <div className="h-full rounded-xl border border-gray-800 bg-gray-900/50 p-6 cursor-pointer hover:border-gray-700 transition-colors">
            <div className="flex items-start justify-between mb-6">
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
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M3 5V19A9 3 0 0 0 21 19V5" />
                  <path d="M3 12A9 3 0 0 0 21 12" />
                </svg>
              </div>
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
                className="text-gray-500"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-white font-semibold text-lg">View DB Contents</h2>
            <p className="text-gray-400 text-sm mt-2">
              Browse and explore database tables and records
            </p>
          </div>
        </Link>

        <Link href="/admin/all-data-gaps" className="block">
          <div className="h-full rounded-xl border border-gray-800 bg-gray-900/50 p-6 cursor-pointer hover:border-gray-700 transition-colors">
            <div className="flex items-start justify-between mb-6">
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
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M3 5V19A9 3 0 0 0 21 19V5" />
                  <path d="M3 12A9 3 0 0 0 21 12" />
                </svg>
              </div>
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
                className="text-gray-500"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-white font-semibold text-lg">All Data Gaps</h2>
            <p className="text-gray-400 text-sm mt-2">
              View and analyze all data gap reports
            </p>
          </div>
        </Link>

        <Link href="/admin/workflow-endpoints" className="block">
          <div className="h-full rounded-xl border border-gray-800 bg-gray-900/50 p-6 cursor-pointer hover:border-gray-700 transition-colors">
            <div className="flex items-start justify-between mb-6">
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
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
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
                className="text-gray-500"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-white font-semibold text-lg">View All Workflow Endpoints</h2>
            <p className="text-gray-400 text-sm mt-2">
              Browse and monitor all workflow API endpoints
            </p>
          </div>
        </Link>
        <Link href="/admin/simulate" className="block">
          <div className="h-full rounded-xl border border-gray-800 bg-gray-900/50 p-6 cursor-pointer hover:border-gray-700 transition-colors">
            <div className="flex items-start justify-between mb-6">
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
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10 8 16 12 10 16 10 8" />
                </svg>
              </div>
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
                className="text-gray-500"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-white font-semibold text-lg">Simulate As-If for a Real Client</h2>
            <p className="text-gray-400 text-sm mt-2">
              Run end-to-end simulations of client workflows
            </p>
          </div>
        </Link>

        <Link href="/admin/define-workflow-endpoints" className="block">
          <div className="h-full rounded-xl border border-gray-800 bg-gray-900/50 p-6 cursor-pointer hover:border-gray-700 transition-colors">
            <div className="flex items-start justify-between mb-6">
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
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
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
                className="text-gray-500"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-white font-semibold text-lg">Define Workflow to API Endpoint URLs</h2>
            <p className="text-gray-400 text-sm mt-2">
              Map workflow slugs to their API endpoint URLs
            </p>
          </div>
        </Link>

        <Link href="/admin/pipeline" className="block">
          <div className="h-full rounded-xl border border-gray-800 bg-gray-900/50 p-6 cursor-pointer hover:border-gray-700 transition-colors">
            <div className="flex items-start justify-between mb-6">
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
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
              </div>
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
                className="text-gray-500"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-white font-semibold text-lg">Pipeline</h2>
            <p className="text-gray-400 text-sm mt-2">
              Track meetings, outcomes, and offer generation
            </p>
          </div>
        </Link>

        <Link href="/admin/calendar" className="block">
          <div className="h-full rounded-xl border border-gray-800 bg-gray-900/50 p-6 cursor-pointer hover:border-gray-700 transition-colors">
            <div className="flex items-start justify-between mb-6">
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
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
              </div>
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
                className="text-gray-500"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-white font-semibold text-lg">Calendar</h2>
            <p className="text-gray-400 text-sm mt-2">
              View and manage your schedule
            </p>
          </div>
        </Link>

        <Link href="/admin/services-to-add" className="block">
          <div className="h-full rounded-xl border border-gray-800 bg-gray-900/50 p-6 cursor-pointer hover:border-gray-700 transition-colors">
            <div className="flex items-start justify-between mb-6">
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
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="16" />
                  <line x1="8" x2="16" y1="12" y2="12" />
                </svg>
              </div>
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
                className="text-gray-500"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-white font-semibold text-lg">Services to Add</h2>
            <p className="text-gray-400 text-sm mt-2">
              Add new services to the platform
            </p>
          </div>
        </Link>

        <Link href="/admin/systems-to-add" className="block">
          <div className="h-full rounded-xl border border-gray-800 bg-gray-900/50 p-6 cursor-pointer hover:border-gray-700 transition-colors">
            <div className="flex items-start justify-between mb-6">
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
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" x2="16" y1="21" y2="21" />
                  <line x1="12" x2="12" y1="17" y2="21" />
                </svg>
              </div>
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
                className="text-gray-500"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-white font-semibold text-lg">Systems to Add</h2>
            <p className="text-gray-400 text-sm mt-2">
              Add new systems to the platform
            </p>
          </div>
        </Link>
        </div>
      </main>
    </div>
  );
}
