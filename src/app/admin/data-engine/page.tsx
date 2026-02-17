'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  createOrgAction,
  createCompanyAction,
  createUserAction,
  issueApiTokenAction,
} from './actions';

type Step = 'org' | 'company' | 'user' | 'token' | 'complete';

interface CreatedEntities {
  org?: { id: string; name: string; slug: string };
  company?: { id: string; name: string };
  user?: { id: string; email: string };
  token?: { token: string; name: string };
}

export default function DataEnginePage() {
  const [step, setStep] = useState<Step>('org');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entities, setEntities] = useState<CreatedEntities>({});

  // Form states
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState('admin');
  const [tokenName, setTokenName] = useState('');

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await createOrgAction(orgName, orgSlug);

    if (result.success) {
      setEntities((prev) => ({
        ...prev,
        org: { id: result.data.id, name: orgName, slug: orgSlug },
      }));
      setStep('company');
    } else {
      setError(result.error || 'Failed to create org');
    }
    setLoading(false);
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entities.org) return;

    setLoading(true);
    setError(null);

    const result = await createCompanyAction(entities.org.id, companyName);

    if (result.success) {
      setEntities((prev) => ({
        ...prev,
        company: { id: result.data.id, name: companyName },
      }));
      setStep('user');
    } else {
      setError(result.error || 'Failed to create company');
    }
    setLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entities.org) return;

    setLoading(true);
    setError(null);

    const result = await createUserAction(
      entities.org.id,
      userEmail,
      userPassword,
      userRole,
      entities.company?.id
    );

    if (result.success) {
      setEntities((prev) => ({
        ...prev,
        user: { id: result.data.id, email: userEmail },
      }));
      setStep('token');
    } else {
      setError(result.error || 'Failed to create user');
    }
    setLoading(false);
  };

  const handleIssueToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entities.user) return;

    setLoading(true);
    setError(null);

    const result = await issueApiTokenAction(entities.user.id, tokenName);

    if (result.success) {
      setEntities((prev) => ({
        ...prev,
        token: { token: result.data.token, name: tokenName },
      }));
      setStep('complete');
    } else {
      setError(result.error || 'Failed to issue token');
    }
    setLoading(false);
  };

  const resetFlow = () => {
    setStep('org');
    setEntities({});
    setOrgName('');
    setOrgSlug('');
    setCompanyName('');
    setUserEmail('');
    setUserPassword('');
    setUserRole('admin');
    setTokenName('');
    setError(null);
  };

  const steps: { key: Step; label: string }[] = [
    { key: 'org', label: 'Create Org' },
    { key: 'company', label: 'Create Company' },
    { key: 'user', label: 'Create User' },
    { key: 'token', label: 'Issue Token' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-gray-800 px-8 py-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/testing"
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
            <h1 className="text-white text-xl font-bold">Data Engine X</h1>
            <p className="text-gray-400 text-sm mt-1">
              Super-admin tenant onboarding
            </p>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-2xl mx-auto">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i < currentStepIndex
                    ? 'bg-green-600 text-white'
                    : i === currentStepIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-500'
                }`}
              >
                {i < currentStepIndex ? '✓' : i + 1}
              </div>
              <span
                className={`ml-2 text-sm ${
                  i <= currentStepIndex ? 'text-white' : 'text-gray-500'
                }`}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={`w-12 h-px mx-4 ${
                    i < currentStepIndex ? 'bg-green-600' : 'bg-gray-800'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-800 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Created Entities Summary */}
        {Object.keys(entities).length > 0 && step !== 'complete' && (
          <div className="mb-6 p-4 bg-gray-900 border border-gray-800 rounded-lg">
            <h3 className="text-gray-400 text-xs uppercase tracking-wide mb-3">
              Created
            </h3>
            <div className="space-y-2 text-sm">
              {entities.org && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Org:</span>
                  <span className="text-white">
                    {entities.org.name} ({entities.org.slug})
                  </span>
                </div>
              )}
              {entities.company && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Company:</span>
                  <span className="text-white">{entities.company.name}</span>
                </div>
              )}
              {entities.user && (
                <div className="flex justify-between">
                  <span className="text-gray-500">User:</span>
                  <span className="text-white">{entities.user.email}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step Forms */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          {step === 'org' && (
            <form onSubmit={handleCreateOrg}>
              <h2 className="text-white font-semibold text-lg mb-4">
                Create Organization
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Acme Inc"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={orgSlug}
                    onChange={(e) => setOrgSlug(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="acme"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Org'}
                </button>
              </div>
            </form>
          )}

          {step === 'company' && (
            <form onSubmit={handleCreateCompany}>
              <h2 className="text-white font-semibold text-lg mb-4">
                Create Company
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Acme Corp"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Company'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('user')}
                  className="w-full text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Skip (create user without company)
                </button>
              </div>
            </form>
          )}

          {step === 'user' && (
            <form onSubmit={handleCreateUser}>
              <h2 className="text-white font-semibold text-lg mb-4">
                Create User
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="user@acme.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Role
                  </label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          )}

          {step === 'token' && (
            <form onSubmit={handleIssueToken}>
              <h2 className="text-white font-semibold text-lg mb-4">
                Issue API Token
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Token Name
                  </label>
                  <input
                    type="text"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Production API Key"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {loading ? 'Issuing...' : 'Issue Token'}
                </button>
              </div>
            </form>
          )}

          {step === 'complete' && (
            <div>
              <h2 className="text-white font-semibold text-lg mb-4">
                Tenant Onboarding Complete
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-green-900/30 border border-green-800 rounded-lg">
                  <p className="text-green-200 text-sm mb-3">
                    Successfully created tenant. Save the API token below - it
                    will only be shown once.
                  </p>
                  <div className="bg-black/50 rounded p-3 font-mono text-sm text-white break-all">
                    {entities.token?.token}
                  </div>
                </div>

                <div className="p-4 bg-gray-800 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Org:</span>
                    <span className="text-white">
                      {entities.org?.name} ({entities.org?.slug})
                    </span>
                  </div>
                  {entities.company && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Company:</span>
                      <span className="text-white">{entities.company.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">User:</span>
                    <span className="text-white">{entities.user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Token:</span>
                    <span className="text-white">{entities.token?.name}</span>
                  </div>
                </div>

                <button
                  onClick={resetFlow}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Onboard Another Tenant
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
