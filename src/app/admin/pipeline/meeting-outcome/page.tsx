"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

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

const OUTCOMES = [
  { value: "completed", label: "Completed" },
  { value: "no_show", label: "No Show" },
  { value: "rescheduled", label: "Rescheduled" },
  { value: "cancelled", label: "Cancelled" },
] as const;

const DEAL_STATUSES = [
  { value: "active", label: "Active" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "stale", label: "Stale" },
] as const;

export default function MeetingOutcomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dealId = searchParams.get("deal_id");

  const [dealDetails, setDealDetails] = useState<DealDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [outcome, setOutcome] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [dealStatus, setDealStatus] = useState<string>("");
  const [sendProposal, setSendProposal] = useState<boolean | null>(null);
  const [sendFollowup, setSendFollowup] = useState<boolean>(false);
  const [followupSubject, setFollowupSubject] = useState<string>("");
  const [followupBody, setFollowupBody] = useState<string>("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

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
        if (data.deal?.notes) {
          setNotes(data.deal.notes);
        }
        if (data.deal?.status) {
          setDealStatus(data.deal.status);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load deal");
      } finally {
        setLoading(false);
      }
    };

    fetchDeal();
  }, [dealId]);

  const handleSendFollowup = async () => {
    if (!dealDetails || !followupSubject || !followupBody) return;

    const contactEmail = dealDetails.contacts[0]?.email;
    if (!contactEmail) {
      setError("No contact email available");
      return;
    }

    try {
      setSendingEmail(true);
      const response = await fetch("https://api.revenueinfra.com/api/pipeline/send-followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deal_id: dealId,
          to_email: contactEmail,
          subject: followupSubject,
          body: followupBody,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.status}`);
      }

      setEmailSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dealId || !outcome || !dealStatus) return;

    try {
      setSubmitting(true);
      const response = await fetch("https://api.revenueinfra.com/api/pipeline/meeting-outcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deal_id: dealId,
          outcome,
          notes,
          deal_status: dealStatus,
          send_proposal: sendProposal,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit: ${response.status}`);
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
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
          <h2 className="text-white text-xl font-semibold mb-2">Meeting Outcome Submitted</h2>
          <p className="text-gray-400 mb-6">Returning to pipeline...</p>
          <button
            onClick={() => router.push("/admin/pipeline")}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-gray-200 transition-colors"
          >
            Back to Pipeline
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
          <h1 className="text-white text-xl font-bold">Meeting Outcome</h1>
        </div>
        <p className="text-gray-400 text-sm">Record the outcome of this meeting</p>
      </header>

      <main className="p-8 max-w-4xl mx-auto">
        {/* Deal Context */}
        {dealDetails && (
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 mb-6">
            <h2 className="text-white font-semibold text-lg mb-4">{dealDetails.deal.company_name}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Domain:</span>{" "}
                <span className="text-gray-300">{dealDetails.deal.company_domain}</span>
              </div>
              <div>
                <span className="text-gray-500">Stage:</span>{" "}
                <span className="text-gray-300">{dealDetails.deal.stage}</span>
              </div>
              {dealDetails.contacts.length > 0 && (
                <div className="col-span-2">
                  <span className="text-gray-500">Contact:</span>{" "}
                  <span className="text-gray-300">
                    {dealDetails.contacts[0].name} ({dealDetails.contacts[0].email})
                  </span>
                </div>
              )}
              {dealDetails.bookings.length > 0 && (
                <div className="col-span-2">
                  <span className="text-gray-500">Latest Meeting:</span>{" "}
                  <span className="text-gray-300">{dealDetails.bookings[0].title}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Meeting Outcome */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <label className="block text-sm text-gray-400 mb-3">Meeting Outcome</label>
            <div className="grid grid-cols-2 gap-3">
              {OUTCOMES.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setOutcome(opt.value)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    outcome === opt.value
                      ? "border-white bg-white text-black"
                      : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <label htmlFor="notes" className="block text-sm text-gray-400 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Meeting notes, key takeaways, action items..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors resize-none"
            />
          </div>

          {/* Deal Status */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <label className="block text-sm text-gray-400 mb-3">Deal Status</label>
            <div className="grid grid-cols-4 gap-3">
              {DEAL_STATUSES.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDealStatus(opt.value)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    dealStatus === opt.value
                      ? "border-white bg-white text-black"
                      : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Send Proposal */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <label className="block text-sm text-gray-400 mb-3">Send Proposal?</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSendProposal(true)}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  sendProposal === true
                    ? "border-white bg-white text-black"
                    : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setSendProposal(false)}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  sendProposal === false
                    ? "border-white bg-white text-black"
                    : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600"
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Send Followup */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm text-gray-400">Send Followup Email</label>
              <button
                type="button"
                onClick={() => setSendFollowup(!sendFollowup)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  sendFollowup
                    ? "border-white bg-white text-black"
                    : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600"
                }`}
              >
                {sendFollowup ? "Enabled" : "Enable"}
              </button>
            </div>

            {sendFollowup && (
              <div className="space-y-4">
                {dealDetails?.contacts[0]?.email && (
                  <div className="text-sm">
                    <span className="text-gray-500">To:</span>{" "}
                    <span className="text-gray-300">{dealDetails.contacts[0].email}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="followupSubject" className="block text-sm text-gray-400 mb-2">
                    Subject
                  </label>
                  <input
                    id="followupSubject"
                    type="text"
                    value={followupSubject}
                    onChange={(e) => setFollowupSubject(e.target.value)}
                    placeholder="Follow up on our meeting..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="followupBody" className="block text-sm text-gray-400 mb-2">
                    Message
                  </label>
                  <textarea
                    id="followupBody"
                    value={followupBody}
                    onChange={(e) => setFollowupBody(e.target.value)}
                    rows={6}
                    placeholder="Hi [Name],&#10;&#10;Thank you for taking the time to meet with us today..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendFollowup}
                  disabled={!followupSubject || !followupBody || sendingEmail || emailSent}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    emailSent
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : followupSubject && followupBody && !sendingEmail
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-800 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {emailSent ? "Email Sent" : sendingEmail ? "Sending..." : "Send Email"}
                </button>
              </div>
            )}
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={!outcome || !dealStatus || submitting}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              outcome && dealStatus && !submitting
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            {submitting ? "Submitting..." : "Submit Meeting Outcome"}
          </button>
        </form>
      </main>
    </div>
  );
}
