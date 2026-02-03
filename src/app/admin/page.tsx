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

        <Link href="/admin/data-gaps" className="block">
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
            <h2 className="text-white font-semibold text-lg">Data Gaps</h2>
            <p className="text-gray-400 text-sm mt-2">
              Identify and analyze data quality gaps
            </p>
          </div>
        </Link>

        <Link href="/admin/past-employer-gaps" className="block">
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
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
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
            <h2 className="text-white font-semibold text-lg">Past Employer Gaps and Stats</h2>
            <p className="text-gray-400 text-sm mt-2">
              View past employer data gaps and statistics
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
        </div>
      </main>
    </div>
  );
}
