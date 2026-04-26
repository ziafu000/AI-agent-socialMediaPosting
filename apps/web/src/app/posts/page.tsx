"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createPost } from "@/lib/n8n-client";

type PostForm = {
  customer_id: string;
  platform: string;
  topic: string;
  caption: string;
  hashtags: string;
  status: string;
  scheduled_at: string;
};

const initialFormState: PostForm = {
  customer_id: "1",
  platform: "facebook",
  topic: "",
  caption: "",
  hashtags: "",
  status: "draft",
  scheduled_at: "",
};

export default function PostsPage() {
  const [form, setForm] = useState<PostForm>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState("");

  function updateField(field: keyof PostForm, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setResult(null);
    setError("");

    try {
      const response = await createPost({
        ...form,
        customer_id: Number(form.customer_id),
      });
      setResult(response);
      setForm(initialFormState);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unexpected error while creating post",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <section className="mx-auto w-full max-w-3xl rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-6">
          <Link
            className="text-sm font-medium text-slate-950 underline"
            href="/"
          >
            Back to customer form
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-slate-950">
            Post Draft
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Create a manual social post draft and save it into MySQL through
            n8n.
          </p>
          <Link
            className="mt-4 inline-flex text-sm font-medium text-slate-950 underline"
            href="/posts/list"
          >
            Open posts table
          </Link>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-3">
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
              onChange={(event) => updateField("hashtags", event.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Scheduled at
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

          <button
            className="w-full rounded-md bg-slate-950 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Creating..." : "Create post draft"}
          </button>
        </form>

        {(result || error) && (
          <pre className="mt-6 overflow-auto rounded-md bg-slate-100 p-4 text-sm text-slate-800">
            {JSON.stringify(result ?? { success: false, message: error }, null, 2)}
          </pre>
        )}
      </section>
    </main>
  );
}
