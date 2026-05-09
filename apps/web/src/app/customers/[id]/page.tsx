"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatDateTime } from "@/lib/datetime";
import {
  BrandProfileRecord,
  CustomerRecord,
  getCustomerDetail,
  PostRecord,
} from "@/lib/n8n-client";

type CustomerDetailResponse = {
  success: boolean;
  customer: CustomerRecord | null;
  brand_profiles: BrandProfileRecord[];
  posts: PostRecord[];
};

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const customerId = Number(params.id);
  const [detail, setDetail] = useState<CustomerDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDetail() {
      setIsLoading(true);
      setError("");

      try {
        const response = (await getCustomerDetail(
          customerId,
        )) as CustomerDetailResponse;
        setDetail(response);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unexpected error while loading customer detail",
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (!Number.isNaN(customerId)) {
      void loadDetail();
    }
  }, [customerId]);

  const customer = detail?.customer;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <section className="mx-auto w-full max-w-6xl rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-6">
          <Link
            className="text-sm font-medium text-slate-950 underline"
            href="/customers"
          >
            Back to customers
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-slate-950">
            Customer Detail
          </h1>
        </div>

        {isLoading ? (
          <div className="rounded-md bg-slate-100 p-4 text-sm text-slate-600">
            Loading customer...
          </div>
        ) : error ? (
          <pre className="overflow-auto rounded-md bg-red-50 p-4 text-sm text-red-800">
            {JSON.stringify({ success: false, message: error }, null, 2)}
          </pre>
        ) : !customer ? (
          <div className="rounded-md bg-slate-100 p-4 text-sm text-slate-600">
            Customer not found.
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="rounded-md border border-slate-200 p-4">
              <h2 className="text-lg font-semibold text-slate-950">
                {customer.name}
              </h2>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-medium text-slate-500">Email</dt>
                  <dd className="text-slate-900">{customer.email}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Company</dt>
                  <dd className="text-slate-900">
                    {customer.company_name ?? ""}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Industry</dt>
                  <dd className="text-slate-900">{customer.industry ?? ""}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Created</dt>
                  <dd className="text-slate-900">
                    {formatDateTime(customer.created_at)}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Brand Profiles
              </h2>
              <div className="mt-3 overflow-x-auto rounded-md border border-slate-200">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Brand</th>
                      <th className="px-3 py-2">Voice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.brand_profiles ?? []).length === 0 ? (
                      <tr>
                        <td className="px-3 py-4 text-slate-500" colSpan={3}>
                          No brand profiles.
                        </td>
                      </tr>
                    ) : (
                      detail.brand_profiles.map((profile) => (
                        <tr
                          className="border-t border-slate-200"
                          key={profile.id}
                        >
                          <td className="px-3 py-2">{profile.id}</td>
                          <td className="px-3 py-2">
                            <Link
                              className="font-medium text-slate-950 underline"
                              href={`/brand-profiles/${profile.id}`}
                            >
                              {profile.brand_name}
                            </Link>
                          </td>
                          <td className="px-3 py-2">{profile.brand_voice}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-950">Posts</h2>
              <div className="mt-3 overflow-x-auto rounded-md border border-slate-200">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Topic</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Scheduled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.posts ?? []).length === 0 ? (
                      <tr>
                        <td className="px-3 py-4 text-slate-500" colSpan={4}>
                          No posts.
                        </td>
                      </tr>
                    ) : (
                      detail.posts.map((post) => (
                        <tr className="border-t border-slate-200" key={post.id}>
                          <td className="px-3 py-2">{post.id}</td>
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
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
