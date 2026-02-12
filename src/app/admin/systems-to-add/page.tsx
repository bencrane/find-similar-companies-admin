"use client";

import Link from "next/link";
import { useState } from "react";

const EVERYTHING_AUTOMATION_ORG_ID = "82488e2d-9626-4789-9baa-f168e8b1f757";

export default function SystemsToAddPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("https://api.serviceengine.xyz/internal/systems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Key": process.env.NEXT_PUBLIC_INTERNAL_API_KEY || "",
        },
        body: JSON.stringify({
          org_id: EVERYTHING_AUTOMATION_ORG_ID,
          name,
          slug,
          description: description || undefined,
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "System created successfully!" });
        // Reset form
        setName("");
        setSlug("");
        setDescription("");
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.message || "Failed to create system" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    // Only auto-generate if slug hasn't been manually edited
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(value));
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

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
            <h1 className="text-white text-xl font-bold">Systems to Add</h1>
            <p className="text-gray-400 text-sm mt-1">
              Add new systems to the platform
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-8">
        <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
          {/* Organization (fixed) */}
          <div className="px-4 py-3 rounded-lg bg-gray-800 border border-gray-700">
            <p className="text-gray-400 text-sm">Organization</p>
            <p className="text-white font-medium">Everything Automation</p>
          </div>

          {/* System Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-white font-medium mb-2"
            >
              System Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              placeholder="Enter system name"
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
            />
          </div>

          {/* Slug */}
          <div>
            <label
              htmlFor="slug"
              className="block text-white font-medium mb-2"
            >
              Slug
            </label>
            <input
              type="text"
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              placeholder="system-slug"
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
            />
            <p className="text-gray-500 text-sm mt-1">
              URL-friendly identifier (auto-generated from name)
            </p>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-white font-medium mb-2"
            >
              Description <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Enter system description"
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors resize-none"
            />
          </div>

          {/* Message */}
          {message && (
            <div
              className={`px-4 py-3 rounded-lg ${
                message.type === "success"
                  ? "bg-green-900/50 border border-green-700 text-green-400"
                  : "bg-red-900/50 border border-red-700 text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !name || !slug}
            className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Creating..." : "Create System"}
          </button>
        </form>
      </main>
    </div>
  );
}
