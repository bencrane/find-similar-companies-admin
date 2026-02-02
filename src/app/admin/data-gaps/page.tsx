"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface GapRecipe {
  id: string;
  label: string;
  description: string;
  source_table: string;
  target_table: string;
  join_column: string;
  comparison: "not_in_target" | "in_target";
  priority: "P0" | "P1" | "P2";
}

interface RecipeState {
  expanded: boolean;
  count: number | null;
  loading: boolean;
  error: string | null;
}

// Standalone gaps that have their own endpoints (not part of the recipes system)
const STANDALONE_GAPS: GapRecipe[] = [
  {
    id: "top-vc-portfolio-missing-customers",
    label: "Top VC Portfolio - Missing Customers",
    description: "Companies in top VC portfolios that don't have customer data yet",
    source_table: "public.top_priority_companies",
    target_table: "core.company_customers",
    join_column: "domain",
    comparison: "not_in_target",
    priority: "P0",
  },
];

export default function DataGapsPage() {
  const [recipes, setRecipes] = useState<GapRecipe[]>([]);
  const [recipeStates, setRecipeStates] = useState<Record<string, RecipeState>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<"all" | "P0" | "P1" | "P2">("all");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Fetch recipes on mount
  useEffect(() => {
    if (!apiUrl) {
      setError("API URL not configured");
      setLoading(false);
      return;
    }

    fetch(`${apiUrl}/api/admin/gaps/recipes`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const recipeList = data.recipes || [];
        // Combine API recipes with standalone gaps
        const allRecipes = [...STANDALONE_GAPS, ...recipeList];
        setRecipes(allRecipes);
        // Initialize states for each recipe
        const states: Record<string, RecipeState> = {};
        allRecipes.forEach((r: GapRecipe) => {
          states[r.id] = { expanded: false, count: null, loading: false, error: null };
        });
        setRecipeStates(states);
        setLoading(false);
      })
      .catch((err) => {
        setError(`Failed to load recipes: ${err.message}`);
        setLoading(false);
      });
  }, [apiUrl]);

  const toggleExpand = (recipeId: string) => {
    setRecipeStates((prev) => {
      const current = prev[recipeId];
      const newExpanded = !current.expanded;

      // If expanding and no count yet, fetch it
      if (newExpanded && current.count === null && !current.loading) {
        fetchCount(recipeId);
      }

      return {
        ...prev,
        [recipeId]: { ...current, expanded: newExpanded },
      };
    });
  };

  // Map of standalone gap IDs to their count endpoints
  const standaloneEndpoints: Record<string, string> = {
    "top-vc-portfolio-missing-customers": "/api/admin/top-vc-portfolio/missing-customers/count",
  };

  const fetchCount = async (recipeId: string) => {
    if (!apiUrl) return;

    setRecipeStates((prev) => ({
      ...prev,
      [recipeId]: { ...prev[recipeId], loading: true, error: null },
    }));

    try {
      // Use standalone endpoint if available, otherwise use recipes endpoint
      const endpoint = standaloneEndpoints[recipeId]
        ? standaloneEndpoints[recipeId]
        : `/api/admin/gaps/recipes/${recipeId}/count`;

      const res = await fetch(`${apiUrl}${endpoint}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setRecipeStates((prev) => ({
        ...prev,
        [recipeId]: { ...prev[recipeId], count: data.count, loading: false },
      }));
    } catch (err) {
      setRecipeStates((prev) => ({
        ...prev,
        [recipeId]: { ...prev[recipeId], error: "Error loading count", loading: false },
      }));
    }
  };

  const filteredRecipes = priorityFilter === "all"
    ? recipes
    : recipes.filter(r => r.priority === priorityFilter);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "P0":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "P1":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "P2":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

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
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M3 5V19A9 3 0 0 0 21 19V5" />
              <path d="M3 12A9 3 0 0 0 21 12" />
            </svg>
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">Data Gaps</h1>
            <p className="text-gray-400 text-sm">Identify and analyze data quality gaps</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-8 max-w-4xl">
        {loading ? (
          <p className="text-gray-400">Loading recipes...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <>
            {/* Filter bar */}
            <div className="flex items-center gap-2 mb-4">
              {(["all", "P0", "P1", "P2"] as const).map((filter) => {
                const isActive = priorityFilter === filter;
                const count = filter === "all"
                  ? recipes.length
                  : recipes.filter(r => r.priority === filter).length;

                return (
                  <button
                    key={filter}
                    onClick={() => setPriorityFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-white text-black"
                        : "bg-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    {filter === "all" ? "All" : filter} ({count})
                  </button>
                );
              })}
            </div>

            <p className="text-gray-500 text-xs uppercase tracking-wide mb-4">
              {filteredRecipes.length} Recipes
            </p>

            <div className="space-y-3">
              {filteredRecipes.map((recipe) => {
                const state = recipeStates[recipe.id] || {
                  expanded: false,
                  count: null,
                  loading: false,
                  error: null,
                };

                return (
                  <div
                    key={recipe.id}
                    className="rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden"
                  >
                    {/* Header - clickable */}
                    <button
                      onClick={() => toggleExpand(recipe.id)}
                      className="w-full p-4 flex items-start gap-3 text-left hover:bg-gray-800/30 transition-colors"
                    >
                      {/* Priority badge */}
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded border ${getPriorityColor(
                          recipe.priority
                        )}`}
                      >
                        {recipe.priority}
                      </span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium">{recipe.label}</h3>
                        <p className="text-gray-400 text-sm mt-1">{recipe.description}</p>
                      </div>

                      {/* Expand icon */}
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
                        className={`text-gray-500 transition-transform ${
                          state.expanded ? "rotate-90" : ""
                        }`}
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </button>

                    {/* Expanded content */}
                    {state.expanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-gray-800">
                        {/* Recipe details */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <span className="text-gray-500 text-sm">Source: </span>
                            <code className="bg-gray-800 px-2 py-0.5 rounded text-sm text-white">
                              {recipe.source_table}
                            </code>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Target: </span>
                            <code className="bg-gray-800 px-2 py-0.5 rounded text-sm text-white">
                              {recipe.target_table}
                            </code>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Join: </span>
                            <code className="bg-gray-800 px-2 py-0.5 rounded text-sm text-white">
                              {recipe.join_column}
                            </code>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Comparison: </span>
                            <code className="bg-gray-800 px-2 py-0.5 rounded text-sm text-white">
                              {recipe.comparison}
                            </code>
                          </div>
                        </div>

                        {/* Count display */}
                        <div className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between">
                          <div>
                            <p className="text-gray-400 text-sm">Records matching gap:</p>
                            {state.loading ? (
                              <p className="text-gray-500 text-2xl font-bold">Loading...</p>
                            ) : state.error ? (
                              <p className="text-red-400 text-sm flex items-center gap-1">
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
                                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                  <path d="M12 9v4" />
                                  <path d="M12 17h.01" />
                                </svg>
                                {state.error}
                              </p>
                            ) : (
                              <p className="text-white text-2xl font-bold">
                                {state.count?.toLocaleString() ?? "—"}
                              </p>
                            )}
                          </div>

                          {/* Refresh button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchCount(recipe.id);
                            }}
                            disabled={state.loading}
                            className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                            title="Refresh count"
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
                              className={state.loading ? "animate-spin" : ""}
                            >
                              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                              <path d="M21 3v5h-5" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
