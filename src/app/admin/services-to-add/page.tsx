"use client";

import Link from "next/link";
import { useState } from "react";

const organizations = [
  { id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", name: "Acme Corporation" },
  { id: "82488e2d-9626-4789-9baa-f168e8b1f757", name: "Everything Automation" },
  { id: "9c187159-adc1-4cdd-af84-5c309d1ccdd8", name: "Modern Full" },
  { id: "22222222-2222-2222-2222-222222222222", name: "Outbound Solutions" },
  { id: "11111111-1111-1111-1111-111111111111", name: "Revenue Activation" },
];

export default function ServicesToAddPage() {
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [recurring, setRecurring] = useState("0");
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("https://api.serviceengine.xyz/internal/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Key": process.env.NEXT_PUBLIC_INTERNAL_API_KEY || "",
        },
        body: JSON.stringify({
          org_id: selectedOrgId,
          name,
          description: description || undefined,
          price: price ? parseFloat(price) : undefined,
          currency,
          recurring: parseInt(recurring),
          public: isPublic,
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Service created successfully!" });
        // Reset form
        setName("");
        setDescription("");
        setPrice("");
        setCurrency("USD");
        setRecurring("0");
        setIsPublic(true);
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.message || "Failed to create service" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
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
            <h1 className="text-white text-xl font-bold">Services to Add</h1>
            <p className="text-gray-400 text-sm mt-1">
              Add new services to the platform
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-8">
        <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
          {/* Organization Select */}
          <div>
            <label
              htmlFor="org-select"
              className="block text-white font-medium mb-2"
            >
              Organization
            </label>
            <select
              id="org-select"
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-gray-500 transition-colors"
            >
              <option value="">Select an organization...</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          {/* Service Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-white font-medium mb-2"
            >
              Service Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter service name"
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
            />
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
              placeholder="Enter service description"
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors resize-none"
            />
          </div>

          {/* Price and Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="price"
                className="block text-white font-medium mb-2"
              >
                Price <span className="text-gray-500">(optional)</span>
              </label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="currency"
                className="block text-white font-medium mb-2"
              >
                Currency
              </label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-gray-500 transition-colors"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          {/* Recurring */}
          <div>
            <label
              htmlFor="recurring"
              className="block text-white font-medium mb-2"
            >
              Billing Type
            </label>
            <select
              id="recurring"
              value={recurring}
              onChange={(e) => setRecurring(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-gray-500 transition-colors"
            >
              <option value="0">One-time</option>
              <option value="1">Recurring</option>
              <option value="2">Both</option>
            </select>
          </div>

          {/* Public Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="public"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-5 h-5 rounded bg-gray-900 border-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
            />
            <label htmlFor="public" className="text-white font-medium">
              Visible in catalog
            </label>
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
            disabled={isSubmitting || !selectedOrgId || !name}
            className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Creating..." : "Create Service"}
          </button>
        </form>
      </main>
    </div>
  );
}
