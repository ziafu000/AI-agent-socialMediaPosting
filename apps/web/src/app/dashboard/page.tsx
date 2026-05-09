"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDateTime } from "@/lib/datetime";
import {
  CustomerRecord,
  DashboardSummary,
  getDashboardSummary,
  listCustomers,
  listPosts,
  listWorkflowLogs,
  PostRecord,
  WorkflowLog,
} from "@/lib/n8n-client";

type DashboardResponse = {
  success: boolean;
  summary: DashboardSummary;
};

type CustomersResponse = {
  success: boolean;
  customers: CustomerRecord[];
};

type PostsResponse = {
  success: boolean;
  posts: PostRecord[];
};

type WorkflowLogsResponse = {
  success: boolean;
  logs: WorkflowLog[];
};

const quickLinks = [
  { href: "/customers", label: "Customers", description: "Open customer list" },
  {
    href: "/brand-profiles",
    label: "Brand profiles",
    description: "Review saved brand context",
  },
  { href: "/posts/list", label: "Posts", description: "Review all post drafts" },
  {
    href: "/workflow-logs",
    label: "Workflow logs",
    description: "Inspect recent n8n runs",
  },
  {
    href: "/scheduled-posts",
    label: "Scheduled",
    description: "Check upcoming scheduled posts",
  },
  {
    href: "/schedule-simulator",
    label: "Simulator",
    description: "Run schedule simulation",
  },
  {
    href: "/content-planner",
    label: "Planner",
    description: "Turn brand context into manual post ideas",
  },
];

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentCustomers, setRecentCustomers] = useState<CustomerRecord[]>([]);
  const [recentPosts, setRecentPosts] = useState<PostRecord[]>([]);
  const [recentLogs, setRecentLogs] = useState<WorkflowLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setIsLoading(true);
    setError("");

    try {
      const [dashboardResponse, customersResponse, postsResponse, logsResponse] =
        (await Promise.all([
          getDashboardSummary(),
          listCustomers(),
          listPosts(),
          listWorkflowLogs(),
        ])) as [
          DashboardResponse,
          CustomersResponse,
          PostsResponse,
          WorkflowLogsResponse,
        ];

      setSummary(dashboardResponse.summary);
      setRecentCustomers((customersResponse.customers ?? []).slice(0, 5));
      setRecentPosts((postsResponse.posts ?? []).slice(0, 5));
      setRecentLogs((logsResponse.logs ?? []).slice(0, 5));
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

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

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

  function statusClasses(status: string) {
    if (status === "published" || status === "success") {
      return "bg-emerald-100 text-emerald-800";
    }

    if (status === "scheduled") {
      return "bg-amber-100 text-amber-800";
    }

    if (status === "failed") {
      return "bg-red-100 text-red-800";
    }

    return "bg-slate-200 text-slate-700";
  }

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

        {metrics.length === 0 && !isLoading ? (
          <div className="rounded-md bg-slate-100 p-4 text-sm text-slate-600">
            No dashboard data loaded.
          </div>
        ) : (
          <div className="grid gap-6">
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

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-md border border-slate-200 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-950">
                      Recent customers
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Latest customer records in local MySQL.
                    </p>
                  </div>
                  <Link
                    className="text-sm font-medium text-slate-950 underline"
                    href="/customers"
                  >
                    View all
                  </Link>
                </div>

                <div className="space-y-3">
                  {recentCustomers.length === 0 ? (
                    <div className="text-sm text-slate-500">
                      No customer data yet.
                    </div>
                  ) : (
                    recentCustomers.map((customer) => (
                      <Link
                        className="block rounded-md border border-slate-200 p-3 transition hover:border-slate-300 hover:bg-slate-50"
                        href={`/customers/${customer.id}`}
                        key={customer.id}
                      >
                        <div className="font-medium text-slate-950">
                          {customer.name}
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          {customer.email}
                        </div>
                        <div className="mt-2 text-xs text-slate-500">
                          {customer.company_name || "No company"} ·{" "}
                          {customer.post_count ?? 0} posts
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-md border border-slate-200 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-950">
                      Recent posts
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Latest saved draft and scheduled records.
                    </p>
                  </div>
                  <Link
                    className="text-sm font-medium text-slate-950 underline"
                    href="/posts/list"
                  >
                    View all
                  </Link>
                </div>

                <div className="space-y-3">
                  {recentPosts.length === 0 ? (
                    <div className="text-sm text-slate-500">
                      No post data yet.
                    </div>
                  ) : (
                    recentPosts.map((post) => (
                      <Link
                        className="block rounded-md border border-slate-200 p-3 transition hover:border-slate-300 hover:bg-slate-50"
                        href={`/posts/${post.id}`}
                        key={post.id}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="font-medium text-slate-950">
                            {post.topic}
                          </div>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${statusClasses(post.status)}`}
                          >
                            {post.status}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          Customer #{post.customer_id} · {post.platform}
                        </div>
                        <div className="mt-2 text-xs text-slate-500">
                          {post.scheduled_at
                            ? `Scheduled ${formatDateTime(post.scheduled_at)}`
                            : `Created ${formatDateTime(post.created_at)}`}
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-md border border-slate-200 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-950">
                      Recent workflow logs
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Latest automation activity and failures.
                    </p>
                  </div>
                  <Link
                    className="text-sm font-medium text-slate-950 underline"
                    href="/workflow-logs"
                  >
                    View all
                  </Link>
                </div>

                <div className="space-y-3">
                  {recentLogs.length === 0 ? (
                    <div className="text-sm text-slate-500">
                      No workflow logs yet.
                    </div>
                  ) : (
                    recentLogs.map((log) => (
                      <div
                        className="rounded-md border border-slate-200 p-3"
                        key={log.id}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="font-medium text-slate-950">
                            {log.workflow_name}
                          </div>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${statusClasses(log.status)}`}
                          >
                            {log.status}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          {log.event_type}
                        </div>
                        <div className="mt-2 text-xs text-slate-500">
                          {formatDateTime(log.created_at)}
                        </div>
                        {log.error_message && (
                          <div className="mt-2 text-xs text-red-700">
                            {log.error_message}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 p-4">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-slate-950">
                  Quick links
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Jump into the main local workflows.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {quickLinks.map((link) => (
                  <Link
                    className="rounded-md border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
                    href={link.href}
                    key={link.href}
                  >
                    <div className="font-medium text-slate-950">
                      {link.label}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {link.description}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
