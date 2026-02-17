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
        <Link href="/admin/testing" className="block">
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
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" x2="8" y1="13" y2="13" />
                  <line x1="16" x2="8" y1="17" y2="17" />
                  <line x1="10" x2="8" y1="9" y2="9" />
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
            <h2 className="text-white font-semibold text-lg">Testing</h2>
            <p className="text-gray-400 text-sm mt-2">
              Testing and development tools
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
        </div>
      </main>
    </div>
  );
}
