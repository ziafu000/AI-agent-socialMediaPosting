"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BrandProfileRecord,
  listBrandProfiles,
  updateBrandProfile,
} from "@/lib/n8n-client";

type BrandProfilesResponse = {
  success: boolean;
  brand_profiles: BrandProfileRecord[];
};

type BrandProfileForm = {
  id: string;
  customer_id: string;
  brand_name: string;
  target_audience: string;
  brand_voice: string;
  products_services: string;
  default_cta: string;
  words_to_use: string;
  words_to_avoid: string;
};

export default function EditBrandProfilePage() {
  const params = useParams<{ id: string }>();
  const profileId = Number(params.id);
  const [form, setForm] = useState<BrandProfileForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      setError("");

      try {
        const response = (await listBrandProfiles()) as BrandProfilesResponse;
        const profile = response.brand_profiles.find(
          (item) => item.id === profileId,
        );

        if (!profile) {
          throw new Error("Brand profile not found");
        }

        setForm({
          id: String(profile.id),
          customer_id: String(profile.customer_id),
          brand_name: profile.brand_name,
          target_audience: profile.target_audience ?? "",
          brand_voice: profile.brand_voice ?? "",
          products_services: profile.products_services ?? "",
          default_cta: profile.default_cta ?? "",
          words_to_use: profile.words_to_use ?? "",
          words_to_avoid: profile.words_to_avoid ?? "",
        });
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unexpected error while loading brand profile",
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (!Number.isNaN(profileId)) {
      void loadProfile();
    }
  }, [profileId]);

  function updateField(field: keyof BrandProfileForm, value: string) {
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
      const response = await updateBrandProfile({
        id: Number(form.id),
        customer_id: Number(form.customer_id),
        brand_name: form.brand_name,
        target_audience: form.target_audience,
        brand_voice: form.brand_voice,
        products_services: form.products_services,
        default_cta: form.default_cta,
        words_to_use: form.words_to_use,
        words_to_avoid: form.words_to_avoid,
      });
      setResult(response);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unexpected error while updating brand profile",
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
            href="/brand-profiles"
          >
            Back to brand profiles
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-slate-950">
            Edit Brand Profile
          </h1>
        </div>

        {isLoading ? (
          <div className="rounded-md bg-slate-100 p-4 text-sm text-slate-600">
            Loading brand profile...
          </div>
        ) : error && !form ? (
          <pre className="overflow-auto rounded-md bg-red-50 p-4 text-sm text-red-800">
            {JSON.stringify({ success: false, message: error }, null, 2)}
          </pre>
        ) : form ? (
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
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
            </div>

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
              {isSubmitting ? "Saving..." : "Update brand profile"}
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
