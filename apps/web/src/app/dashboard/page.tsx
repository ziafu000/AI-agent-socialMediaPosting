"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardSummary, getDashboardSummary } from "@/lib/n8n-client";

type DashboardResponse = {
  success: boolean;
  summary: DashboardSummary;
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setIsLoading(true);
    setError("");

    try {
      const response = (await getDashboardSummary()) as DashboardResponse;
      setSummary(response.summary);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unexpected error while loading dashboard",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const metrics = summary
    ? [
        ["Customers", summary.customer_count],
        ["Brand profiles", summary.brand_profile_count],
        ["Posts", summary.post_count],
        ["Draft", summary.draft_count],
        ["Scheduled", summary.scheduled_count],
        ["Published", summary.published_count],
        ["Failed", summary.failed_count],
        ["Workflow logs", summary.workflow_log_count],
      ]
    : [];

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <section className="mx-auto w-full max-w-6xl rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              className="text-sm font-medium text-slate-950 underline"
              href="/"
            >
              Back to home
            </Link>
            <h1 className="mt-4 text-2xl font-semibold text-slate-950">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Local skeleton health summary from MySQL.
            </p>
          </div>

          <button
            className="rounded-md bg-slate-950 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={isLoading}
            onClick={loadDashboard}
            type="button"
          >
            {isLoading ? "Loading..." : "Refresh dashboard"}
          </button>
        </div>

        {error && (
          <pre className="mb-4 overflow-auto rounded-md bg-red-50 p-4 text-sm text-red-800">
            {JSON.stringify({ success: false, message: error }, null, 2)}
          </pre>
        )}

        {metrics.length === 0 ? (
          <div className="rounded-md bg-slate-100 p-4 text-sm text-slate-600">
            No dashboard data loaded.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map(([label, value]) => (
              <div
                className="rounded-md border border-slate-200 bg-white p-4"
                key={label}
              >
                <div className="text-sm font-medium text-slate-500">
                  {label}
                </div>
                <div className="mt-2 text-3xl font-semibold text-slate-950">
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
