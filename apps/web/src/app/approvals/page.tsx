"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDateTime } from "@/lib/datetime";
import {
  listPosts,
  PostRecord,
  reviewPost,
  ReviewPostAction,
} from "@/lib/n8n-client";

type PostsResponse = {
  success: boolean;
  posts: PostRecord[];
};

const reviewStatuses = [
  "needs_review",
  "approved",
  "scheduled",
  "cancelled",
];

function canRunAction(status: string, action: ReviewPostAction) {
  if (action === "approve" || action === "reject") {
    return status === "needs_review";
  }

  return ["draft", "needs_review", "approved", "scheduled"].includes(status);
}

export default function ApprovalsPage() {
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState("needs_review");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState("");
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState("");

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const isReviewPost =
        reviewStatuses.includes(post.status) || post.status === "draft";
      const matchesStatus =
        statusFilter === "all" || post.status === statusFilter;

      return isReviewPost && matchesStatus;
    });
  }, [posts, statusFilter]);

  async function loadPosts() {
    setIsLoading(true);
    setResult(null);
    setError("");

    try {
      const response = (await listPosts()) as PostsResponse;
      setPosts(response.posts ?? []);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unexpected error while loading approval queue",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function runReviewAction(postId: number, action: ReviewPostAction) {
    const actionKey = `${postId}:${action}`;
    setPendingAction(actionKey);
    setResult(null);
    setError("");

    try {
      const response = await reviewPost({ id: postId, action });
      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId ? { ...post, status: response.status } : post,
        ),
      );
      setResult(response);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unexpected error while reviewing post",
      );
    } finally {
      setPendingAction("");
    }
  }

  function actionLabel(
    postId: number,
    action: ReviewPostAction,
    idleLabel: string,
  ) {
    return pendingAction === `${postId}:${action}` ? "Working..." : idleLabel;
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <section className="mx-auto w-full max-w-7xl rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              className="text-sm font-medium text-slate-950 underline"
              href="/dashboard"
            >
              Back to dashboard
            </Link>
            <h1 className="mt-4 text-2xl font-semibold text-slate-950">
              Approval Queue
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Approve, reject, or cancel post drafts before scheduling.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <select
              className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All review statuses</option>
              <option value="draft">Draft</option>
              <option value="needs_review">Needs review</option>
              <option value="approved">Approved</option>
              <option value="scheduled">Scheduled</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              className="rounded-md bg-slate-950 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={isLoading || Boolean(pendingAction)}
              onClick={loadPosts}
              type="button"
            >
              {isLoading ? "Loading..." : "Refresh queue"}
            </button>
          </div>
        </div>

        {Boolean(error || result) && (
          <pre
            className={`mb-4 overflow-auto rounded-md p-4 text-sm ${
              error ? "bg-red-50 text-red-800" : "bg-slate-100 text-slate-800"
            }`}
          >
            {JSON.stringify(result ?? { success: false, message: error }, null, 2)}
          </pre>
        )}

        <div className="overflow-x-auto rounded-md border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Platform</th>
                <th className="px-3 py-2">Topic</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Scheduled at</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-slate-500" colSpan={7}>
                    No posts loaded for this approval filter.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr className="border-t border-slate-200" key={post.id}>
                    <td className="px-3 py-2">{post.id}</td>
                    <td className="px-3 py-2">{post.customer_id}</td>
                    <td className="px-3 py-2">{post.platform}</td>
                    <td className="px-3 py-2">
                      <Link
                        className="font-medium text-slate-950 underline"
                        href={`/posts/${post.id}`}
                      >
                        {post.topic}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{post.status}</td>
                    <td className="px-3 py-2">
                      {formatDateTime(post.scheduled_at)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded-md bg-emerald-700 px-3 py-1.5 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                          disabled={
                            Boolean(pendingAction) ||
                            !canRunAction(post.status, "approve")
                          }
                          type="button"
                          onClick={() => runReviewAction(post.id, "approve")}
                        >
                          {actionLabel(post.id, "approve", "Approve")}
                        </button>
                        <button
                          className="rounded-md bg-red-700 px-3 py-1.5 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                          disabled={
                            Boolean(pendingAction) ||
                            !canRunAction(post.status, "reject")
                          }
                          type="button"
                          onClick={() => runReviewAction(post.id, "reject")}
                        >
                          {actionLabel(post.id, "reject", "Reject")}
                        </button>
                        <button
                          className="rounded-md border border-slate-400 px-3 py-1.5 font-medium text-slate-800 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
                          disabled={
                            Boolean(pendingAction) ||
                            !canRunAction(post.status, "cancel")
                          }
                          type="button"
                          onClick={() => runReviewAction(post.id, "cancel")}
                        >
                          {actionLabel(post.id, "cancel", "Cancel")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
