"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface System {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export default function ModalEndpointInstantiationPage() {
  const [systems, setSystems] = useState<System[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<string>("");

  useEffect(() => {
    async function fetchSystems() {
      try {
        const response = await fetch(
          "https://api.serviceengine.xyz/public/orgs/everything-automation/systems"
        );
        if (response.ok) {
          const data = await response.json();
          setSystems(data);
        } else {
          setError("Failed to load systems");
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSystems();
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 px-8 py-6">
        <div className="flex items-center gap-4">
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
          <div>
            <h1 className="text-white text-xl font-bold">
              Send System for Modal Endpoint Instantiation
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Select a system to instantiate as a Modal endpoint
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-8">
        <div className="max-w-lg">
          {isLoading ? (
            <div className="text-gray-400">Loading systems...</div>
          ) : error ? (
            <div className="px-4 py-3 rounded-lg bg-red-900/50 border border-red-700 text-red-400">
              {error}
            </div>
          ) : (
            <>
              <label
                htmlFor="system-select"
                className="block text-white font-medium mb-2"
              >
                Select a System
              </label>
              <select
                id="system-select"
                value={selectedSystem}
                onChange={(e) => setSelectedSystem(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-gray-500 transition-colors"
              >
                <option value="">Choose a system...</option>
                {systems.map((system) => (
                  <option key={system.id} value={system.id}>
                    {system.name}
                  </option>
                ))}
              </select>

              {selectedSystem && (
                <div className="mt-6 p-4 rounded-lg bg-gray-900 border border-gray-700">
                  <h3 className="text-white font-medium mb-2">Selected System</h3>
                  {(() => {
                    const system = systems.find((s) => s.id === selectedSystem);
                    return system ? (
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-gray-400">Name:</span>{" "}
                          <span className="text-white">{system.name}</span>
                        </p>
                        <p>
                          <span className="text-gray-400">Slug:</span>{" "}
                          <span className="text-white">{system.slug}</span>
                        </p>
                        {system.description && (
                          <p>
                            <span className="text-gray-400">Description:</span>{" "}
                            <span className="text-white">{system.description}</span>
                          </p>
                        )}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              <button
                disabled={!selectedSystem}
                className="mt-6 w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
              >
                Send to Modal
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
