"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDateTime } from "@/lib/datetime";
import { listPosts, PostRecord } from "@/lib/n8n-client";

type PostsResponse = {
  success: boolean;
  posts: PostRecord[];
};

export default function PostsListPage() {
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesQuery =
        !normalizedQuery ||
        [post.topic, post.caption ?? "", post.hashtags ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesStatus =
        statusFilter === "all" || post.status === statusFilter;
      const matchesPlatform =
        platformFilter === "all" || post.platform === platformFilter;

      return matchesQuery && matchesStatus && matchesPlatform;
    });
  }, [platformFilter, posts, query, statusFilter]);

  async function loadPosts() {
    setIsLoading(true);
    setError("");

    try {
      const response = (await listPosts()) as PostsResponse;
      setPosts(response.posts ?? []);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unexpected error while loading posts",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <section className="mx-auto w-full max-w-7xl rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              className="text-sm font-medium text-slate-950 underline"
              href="/posts"
            >
              Back to post draft form
            </Link>
            <h1 className="mt-4 text-2xl font-semibold text-slate-950">
              Posts Table
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Review all saved post drafts in the app before moving on to AI or
              publishing workflows.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              placeholder="Search posts"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <select
              className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="needs_review">Needs review</option>
              <option value="approved">Approved</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              value={platformFilter}
              onChange={(event) => setPlatformFilter(event.target.value)}
            >
              <option value="all">All platforms</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="tiktok">TikTok</option>
            </select>
            <button
              className="rounded-md bg-slate-950 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={isLoading}
              onClick={loadPosts}
              type="button"
            >
              {isLoading ? "Loading..." : "Refresh posts"}
            </button>
          </div>
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
              {filteredPosts.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-slate-500" colSpan={7}>
                    No posts loaded.
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
                      {formatDateTime(post.created_at)}
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
