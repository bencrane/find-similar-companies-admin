import Link from "next/link";

export default function DataIngestPage() {
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
          <span className="font-semibold">Data Ingest</span>
        </Link>
      </header>

      {/* Content */}
      <main className="p-8">
        <Link href="/enrichment">
          <div className="max-w-md rounded-xl border border-gray-800 bg-gray-900/50 p-6 cursor-pointer hover:border-gray-700 transition-colors">
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
                  <path d="M12 3v12" />
                  <path d="m8 11 4 4 4-4" />
                  <path d="M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4" />
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
            <h2 className="text-white font-semibold text-lg">Find Similar Companies</h2>
            <p className="text-gray-400 text-sm mt-2">
              Upload domains and find lookalike companies that match your best customers
            </p>
          </div>
        </Link>
      </main>
    </div>
  );
}
