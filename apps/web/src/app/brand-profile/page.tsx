"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { saveBrandProfile } from "@/lib/n8n-client";

type BrandProfileForm = {
  customer_id: string;
  brand_name: string;
  target_audience: string;
  brand_voice: string;
  products_services: string;
  default_cta: string;
  words_to_use: string;
  words_to_avoid: string;
};

const initialFormState: BrandProfileForm = {
  customer_id: "1",
  brand_name: "",
  target_audience: "",
  brand_voice: "",
  products_services: "",
  default_cta: "",
  words_to_use: "",
  words_to_avoid: "",
};

export default function BrandProfilePage() {
  const [form, setForm] = useState<BrandProfileForm>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState("");

  function updateField(field: keyof BrandProfileForm, value: string) {
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
      const response = await saveBrandProfile({
        ...form,
        customer_id: Number(form.customer_id),
      });
      setResult(response);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unexpected error while saving brand profile",
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
            Brand Profile
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Save the customer brand details into MySQL through n8n.
          </p>
          <Link
            className="mt-4 inline-flex text-sm font-medium text-slate-950 underline"
            href="/brand-profiles"
          >
            Open brand profiles
          </Link>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
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
              Brand name
            </span>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              required
              type="text"
              value={form.brand_name}
              onChange={(event) =>
                updateField("brand_name", event.target.value)
              }
            />
          </label>

          {[
            ["target_audience", "Target audience"],
            ["brand_voice", "Brand voice"],
            ["products_services", "Products / services"],
            ["default_cta", "Default CTA"],
            ["words_to_use", "Words to use"],
            ["words_to_avoid", "Words to avoid"],
          ].map(([field, label]) => (
            <label className="block" key={field}>
              <span className="text-sm font-medium text-slate-700">
                {label}
              </span>
              <textarea
                className="mt-1 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                value={form[field as keyof BrandProfileForm]}
                onChange={(event) =>
                  updateField(
                    field as keyof BrandProfileForm,
                    event.target.value,
                  )
                }
              />
            </label>
          ))}

          <button
            className="w-full rounded-md bg-slate-950 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Saving..." : "Save brand profile"}
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
