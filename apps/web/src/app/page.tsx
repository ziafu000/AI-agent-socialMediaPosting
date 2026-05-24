"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createCustomer } from "@/lib/n8n-client";

type FormState = {
  name: string;
  email: string;
  company_name: string;
  industry: string;
};

const initialFormState: FormState = {
  name: "",
  email: "",
  company_name: "",
  industry: "",
};

export default function Home() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState("");

  function updateField(field: keyof FormState, value: string) {
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
      const response = await createCustomer(form);
      setResult(response);
      setForm(initialFormState);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unexpected error while creating customer",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-xl rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-950">
            AI Social SaaS
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Demo frontend gui thong tin khach hang sang n8n.
          </p>
          <Link
            className="mt-4 inline-flex text-sm font-medium text-slate-950 underline"
            href="/dashboard"
          >
            Open dashboard
          </Link>
          <Link
            className="ml-4 mt-4 inline-flex text-sm font-medium text-slate-950 underline"
            href="/customers"
          >
            Open customers
          </Link>
          <Link
            className="ml-4 mt-4 inline-flex text-sm font-medium text-slate-950 underline"
            href="/brand-profile"
          >
            Open brand profile form
          </Link>
          <Link
            className="ml-4 mt-4 inline-flex text-sm font-medium text-slate-950 underline"
            href="/brand-profiles"
          >
            Open brand profiles
          </Link>
          <Link
            className="ml-4 mt-4 inline-flex text-sm font-medium text-slate-950 underline"
            href="/posts"
          >
            Open post draft form
          </Link>
          <Link
            className="ml-4 mt-4 inline-flex text-sm font-medium text-slate-950 underline"
            href="/workflow-logs"
          >
            Open workflow logs
          </Link>
          <Link
            className="ml-4 mt-4 inline-flex text-sm font-medium text-slate-950 underline"
            href="/posts/list"
          >
            Open posts table
          </Link>
          <Link
            className="ml-4 mt-4 inline-flex text-sm font-medium text-slate-950 underline"
            href="/scheduled-posts"
          >
            Open scheduled posts
          </Link>
          <Link
            className="ml-4 mt-4 inline-flex text-sm font-medium text-slate-950 underline"
            href="/approvals"
          >
            Open approvals
          </Link>
          <Link
            className="ml-4 mt-4 inline-flex text-sm font-medium text-slate-950 underline"
            href="/schedule-simulator"
          >
            Open schedule simulator
          </Link>
          <Link
            className="ml-4 mt-4 inline-flex text-sm font-medium text-slate-950 underline"
            href="/content-planner"
          >
            Open content planner
          </Link>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Name</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              required
              type="text"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              required
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Company name
            </span>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              type="text"
              value={form.company_name}
              onChange={(event) =>
                updateField("company_name", event.target.value)
              }
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Industry</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              type="text"
              value={form.industry}
              onChange={(event) => updateField("industry", event.target.value)}
            />
          </label>

          <button
            className="w-full rounded-md bg-slate-950 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Submitting..." : "Create customer"}
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
