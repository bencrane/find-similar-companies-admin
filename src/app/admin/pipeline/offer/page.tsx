"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface DealDetails {
  deal: {
    id: string;
    company_name: string;
    company_domain: string;
    stage: string;
    status: string;
    value: number | null;
    notes: string | null;
  };
  contacts: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  bookings: Array<{
    id: string;
    title: string;
    start_time: string;
    attended: boolean | null;
  }>;
}

interface ProposalItem {
  id: string;
  name: string;
  description: string;
  price: string;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export default function OfferPage() {
  const searchParams = useSearchParams();
  const dealId = searchParams.get("deal_id");

  const [dealDetails, setDealDetails] = useState<DealDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [noProposal, setNoProposal] = useState(false);

  // Client info (pre-filled from deal)
  const [clientEmail, setClientEmail] = useState("");
  const [clientNameF, setClientNameF] = useState("");
  const [clientNameL, setClientNameL] = useState("");
  const [clientCompany, setClientCompany] = useState("");

  // Proposal items
  const [items, setItems] = useState<ProposalItem[]>([
    { id: generateId(), name: "", description: "", price: "" },
  ]);

  // Notes
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!dealId) {
      setError("No deal ID provided");
      setLoading(false);
      return;
    }

    const fetchDeal = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://api.revenueinfra.com/api/pipeline/deal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deal_id: dealId }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch deal: ${response.status}`);
        }

        const data = await response.json();
        setDealDetails(data);

        // Pre-fill client info
        if (data.contacts?.length > 0) {
          const contact = data.contacts[0];
          setClientEmail(contact.email || "");
          const nameParts = (contact.name || "").split(" ");
          setClientNameF(nameParts[0] || "");
          setClientNameL(nameParts.slice(1).join(" ") || "");
        }
        if (data.deal?.company_name) {
          setClientCompany(data.deal.company_name);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load deal");
      } finally {
        setLoading(false);
      }
    };

    fetchDeal();
  }, [dealId]);

  const addItem = () => {
    setItems([...items, { id: generateId(), name: "", description: "", price: "" }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof ProposalItem, value: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const calculateTotal = (): number => {
    return items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  };

  const isFormValid = (): boolean => {
    if (!clientEmail || !clientNameF || !clientNameL || !clientCompany) return false;
    return items.every((item) => item.name && item.description && item.price && parseFloat(item.price) >= 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) return;

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch("https://api.revenueinfra.com/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_email: clientEmail,
          client_name_f: clientNameF,
          client_name_l: clientNameL,
          client_company: clientCompany,
          items: items.map((item) => ({
            name: item.name,
            description: item.description,
            price: parseFloat(item.price),
          })),
          notes: notes || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to create proposal: ${response.status}`);
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create proposal");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNoProposal = () => {
    setNoProposal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">Loading deal details...</p>
      </div>
    );
  }

  if (error && !dealDetails) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/admin/pipeline" className="text-gray-400 hover:text-white">
            Back to Pipeline
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-400"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">Proposal Created</h2>
          <p className="text-gray-400 mb-6">You can close this tab now.</p>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-gray-200 transition-colors"
          >
            Close Tab
          </button>
        </div>
      </div>
    );
  }

  if (noProposal) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">No Proposal</h2>
          <p className="text-gray-400 mb-6">Skipped proposal creation for this deal.</p>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-gray-200 transition-colors"
          >
            Close Tab
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-gray-800 px-8 py-6">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/admin/pipeline" className="text-gray-400 hover:text-white transition-colors">
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
          <h1 className="text-white text-xl font-bold">Create Proposal</h1>
        </div>
        <p className="text-gray-400 text-sm">Create a proposal for this deal</p>
      </header>

      <main className="p-8 max-w-3xl">
        {/* No Proposal Option */}
        <button
          onClick={handleNoProposal}
          className="mb-6 px-4 py-2 text-sm font-medium rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300 transition-colors border border-gray-700"
        >
          No Proposal Needed
        </button>

        {/* Deal Context */}
        {dealDetails && (
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 mb-6">
            <h2 className="text-white font-semibold text-lg mb-2">{dealDetails.deal.company_name}</h2>
            <p className="text-gray-400 text-sm">{dealDetails.deal.company_domain}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Info */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <h3 className="text-white font-medium mb-4">Client Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="clientNameF" className="block text-sm text-gray-400 mb-2">
                  First Name
                </label>
                <input
                  id="clientNameF"
                  type="text"
                  value={clientNameF}
                  onChange={(e) => setClientNameF(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="clientNameL" className="block text-sm text-gray-400 mb-2">
                  Last Name
                </label>
                <input
                  id="clientNameL"
                  type="text"
                  value={clientNameL}
                  onChange={(e) => setClientNameL(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="clientEmail" className="block text-sm text-gray-400 mb-2">
                  Email
                </label>
                <input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="clientCompany" className="block text-sm text-gray-400 mb-2">
                  Company
                </label>
                <input
                  id="clientCompany"
                  type="text"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Proposal Items */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Proposal Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors border border-gray-700"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm font-medium">Item {index + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
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
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Project Name</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, "name", e.target.value)}
                        placeholder="e.g., Website Redesign"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Description</label>
                      <textarea
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        placeholder="Describe the scope and deliverables..."
                        rows={2}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Price ($)</label>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, "price", e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="100"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
              <span className="text-gray-400 font-medium">Total</span>
              <span className="text-white text-xl font-semibold">
                ${calculateTotal().toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <label htmlFor="notes" className="block text-sm text-gray-400 mb-2">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes for this proposal..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors resize-none"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={!isFormValid() || submitting}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              isFormValid() && !submitting
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            {submitting ? "Creating Proposal..." : "Create Proposal"}
          </button>
        </form>
      </main>
    </div>
  );
}
