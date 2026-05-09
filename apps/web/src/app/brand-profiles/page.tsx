"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDateTime } from "@/lib/datetime";
import { BrandProfileRecord, listBrandProfiles } from "@/lib/n8n-client";

type BrandProfilesResponse = {
  success: boolean;
  brand_profiles: BrandProfileRecord[];
};

export default function BrandProfilesPage() {
  const [profiles, setProfiles] = useState<BrandProfileRecord[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredProfiles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return profiles;
    }

    return profiles.filter((profile) =>
      [
        profile.brand_name,
        profile.customer_name ?? "",
        profile.target_audience,
        profile.brand_voice,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [profiles, query]);

  async function loadProfiles() {
    setIsLoading(true);
    setError("");

    try {
      const response = (await listBrandProfiles()) as BrandProfilesResponse;
      setProfiles(response.brand_profiles ?? []);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unexpected error while loading brand profiles",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <section className="mx-auto w-full max-w-6xl rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              className="text-sm font-medium text-slate-950 underline"
              href="/brand-profile"
            >
              Back to brand profile form
            </Link>
            <h1 className="mt-4 text-2xl font-semibold text-slate-950">
              Brand Profiles
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Review and edit saved brand context before content generation is
              added.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              className="min-w-72 rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              placeholder="Search profiles"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button
              className="rounded-md bg-slate-950 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={isLoading}
              onClick={loadProfiles}
              type="button"
            >
              {isLoading ? "Loading..." : "Refresh"}
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
                <th className="px-3 py-2">Brand</th>
                <th className="px-3 py-2">Audience</th>
                <th className="px-3 py-2">Voice</th>
                <th className="px-3 py-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-slate-500" colSpan={6}>
                    No brand profiles loaded.
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((profile) => (
                  <tr className="border-t border-slate-200" key={profile.id}>
                    <td className="px-3 py-2">{profile.id}</td>
                    <td className="px-3 py-2">
                      <Link
                        className="font-medium text-slate-950 underline"
                        href={`/customers/${profile.customer_id}`}
                      >
                        {profile.customer_name ?? profile.customer_id}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        className="font-medium text-slate-950 underline"
                        href={`/brand-profiles/${profile.id}`}
                      >
                        {profile.brand_name}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{profile.target_audience}</td>
                    <td className="px-3 py-2">{profile.brand_voice}</td>
                    <td className="px-3 py-2">
                      {formatDateTime(profile.updated_at)}
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
