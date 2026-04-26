"use client";

import { useState } from "react";
import Link from "next/link";
import { listScheduledPosts, ScheduledPost } from "@/lib/n8n-client";

type ScheduledPostsResponse = {
  success: boolean;
  posts: ScheduledPost[];
};

export default function ScheduledPostsPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadScheduledPosts() {
    setIsLoading(true);
    setError("");

    try {
      const response = (await listScheduledPosts()) as ScheduledPostsResponse;
      setPosts(response.posts ?? []);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unexpected error while loading scheduled posts",
      );
    } finally {
      setIsLoading(false);
    }
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
              Back to customer form
            </Link>
            <h1 className="mt-4 text-2xl font-semibold text-slate-950">
              Scheduled Posts
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Review post drafts that already have a schedule time.
            </p>
            <Link
              className="mt-4 inline-flex text-sm font-medium text-slate-950 underline"
              href="/schedule-simulator"
            >
              Open schedule simulator
            </Link>
          </div>

          <button
            className="rounded-md bg-slate-950 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={isLoading}
            onClick={loadScheduledPosts}
            type="button"
          >
            {isLoading ? "Loading..." : "Refresh scheduled posts"}
          </button>
        </div>

        {error && (
          <pre className="mb-4 overflow-auto rounded-md bg-red-50 p-4 text-sm text-red-800">
            {JSON.stringify({ success: false, message: error }, null, 2)}
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
                <th className="px-3 py-2">Created at</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-slate-500" colSpan={7}>
                    No scheduled posts loaded.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr className="border-t border-slate-200" key={post.id}>
                    <td className="px-3 py-2">{post.id}</td>
                    <td className="px-3 py-2">{post.customer_id}</td>
                    <td className="px-3 py-2">{post.platform}</td>
                    <td className="px-3 py-2">{post.topic}</td>
                    <td className="px-3 py-2">{post.status}</td>
                    <td className="px-3 py-2">{post.scheduled_at ?? ""}</td>
                    <td className="px-3 py-2">{post.created_at}</td>
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
