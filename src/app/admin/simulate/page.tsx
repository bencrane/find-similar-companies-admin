import Link from "next/link";

export default function SimulatePage() {
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
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" />
            </svg>
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">Simulate As-If for a Real Client</h1>
            <p className="text-gray-400 text-sm">Run end-to-end simulations of client workflows</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/simulate/crm-to-enriched" className="block">
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
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
              <h2 className="text-white font-semibold text-lg">From CRM Work Emails to Fully Enriched</h2>
              <p className="text-gray-400 text-sm mt-2">
                Simulate enriching raw CRM work emails into full company and contact profiles
              </p>
            </div>
          </Link>

          <Link href="/admin/simulate/tam-to-outbound" className="block">
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
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
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
              <h2 className="text-white font-semibold text-lg">From Assigned TAM to Fully Baked Outbound Campaigns</h2>
              <p className="text-gray-400 text-sm mt-2">
                Simulate generating complete outbound campaigns from an assigned TAM
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
