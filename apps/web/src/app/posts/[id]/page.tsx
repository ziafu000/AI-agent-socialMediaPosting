"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toDatetimeLocalValue } from "@/lib/datetime";
import {
  listPosts,
  PostRecord,
  schedulePost,
  updatePost,
} from "@/lib/n8n-client";

type PostsResponse = {
  success: boolean;
  posts: PostRecord[];
};

type EditPostForm = {
  id: string;
  customer_id: string;
  platform: string;
  topic: string;
  caption: string;
  hashtags: string;
  status: string;
  scheduled_at: string;
};

export default function EditPostPage() {
  const params = useParams<{ id: string }>();
  const postId = Number(params.id);

  const [form, setForm] = useState<EditPostForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPost() {
      setIsLoading(true);
      setError("");

      try {
        const response = (await listPosts()) as PostsResponse;
        const post = response.posts.find((item) => item.id === postId);

        if (!post) {
          throw new Error("Post not found");
        }

        setForm({
          id: String(post.id),
          customer_id: String(post.customer_id),
          platform: post.platform,
          topic: post.topic,
          caption: post.caption ?? "",
          hashtags: post.hashtags ?? "",
          status: post.status,
          scheduled_at: toDatetimeLocalValue(post.scheduled_at),
        });
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unexpected error while loading post",
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (!Number.isNaN(postId)) {
      void loadPost();
    }
  }, [postId]);

  function updateField(field: keyof EditPostForm, value: string) {
    setForm((currentForm) =>
      currentForm
        ? {
            ...currentForm,
            [field]: value,
          }
        : currentForm,
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form) {
      return;
    }

    setIsSubmitting(true);
    setResult(null);
    setError("");

    try {
      const response = await updatePost({
        id: Number(form.id),
        customer_id: Number(form.customer_id),
        platform: form.platform,
        topic: form.topic,
        caption: form.caption,
        hashtags: form.hashtags,
        status: form.status,
        scheduled_at: form.scheduled_at,
      });
      setResult(response);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unexpected error while updating post",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSchedulePost() {
    if (!form) {
      return;
    }

    setIsScheduling(true);
    setResult(null);
    setError("");

    try {
      const response = await schedulePost({
        id: Number(form.id),
        scheduled_at: form.scheduled_at,
      });
      setForm((currentForm) =>
        currentForm
          ? {
              ...currentForm,
              status: "scheduled",
            }
          : currentForm,
      );
      setResult(response);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unexpected error while scheduling post",
      );
    } finally {
      setIsScheduling(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <section className="mx-auto w-full max-w-3xl rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-6">
          <Link
            className="text-sm font-medium text-slate-950 underline"
            href="/posts/list"
          >
            Back to posts table
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-slate-950">
            Edit Post
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Update an existing post draft status, content, and schedule.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-md bg-slate-100 p-4 text-sm text-slate-600">
            Loading post...
          </div>
        ) : error && !form ? (
          <pre className="overflow-auto rounded-md bg-red-50 p-4 text-sm text-red-800">
            {JSON.stringify({ success: false, message: error }, null, 2)}
          </pre>
        ) : form ? (
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">ID</span>
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2"
                  disabled
                  type="text"
                  value={form.id}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Customer ID
                </span>
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                  min="1"
                  required
                  type="number"
                  value={form.customer_id}
                  onChange={(event) =>
                    updateField("customer_id", event.target.value)
                  }
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Platform
                </span>
                <select
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                  value={form.platform}
                  onChange={(event) =>
                    updateField("platform", event.target.value)
                  }
                >
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="tiktok">TikTok</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Topic</span>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                required
                type="text"
                value={form.topic}
                onChange={(event) => updateField("topic", event.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Caption</span>
              <textarea
                className="mt-1 min-h-32 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                value={form.caption}
                onChange={(event) => updateField("caption", event.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Hashtags
              </span>
              <textarea
                className="mt-1 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                value={form.hashtags}
                onChange={(event) =>
                  updateField("hashtags", event.target.value)
                }
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Status
                </span>
                <select
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                  value={form.status}
                  onChange={(event) => updateField("status", event.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="needs_review">Needs review</option>
                  <option value="approved">Approved</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Scheduled at (GMT+7)
                </span>
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                  type="datetime-local"
                  value={form.scheduled_at}
                  onChange={(event) =>
                    updateField("scheduled_at", event.target.value)
                  }
                />
              </label>
            </div>

            <button
              className="w-full rounded-md bg-slate-950 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={isSubmitting || isScheduling}
              type="submit"
            >
              {isSubmitting ? "Saving..." : "Update post"}
            </button>

            <button
              className="w-full rounded-md border border-slate-950 px-4 py-2 font-medium text-slate-950 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
              disabled={isSubmitting || isScheduling}
              type="button"
              onClick={handleSchedulePost}
            >
              {isScheduling ? "Scheduling..." : "Schedule post"}
            </button>
          </form>
        ) : null}

        {(result || (error && form)) && (
          <pre className="mt-6 overflow-auto rounded-md bg-slate-100 p-4 text-sm text-slate-800">
            {JSON.stringify(result ?? { success: false, message: error }, null, 2)}
          </pre>
        )}
      </section>
    </main>
  );
}
