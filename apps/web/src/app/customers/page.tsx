"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CustomerRecord, listCustomers } from "@/lib/n8n-client";

type CustomersResponse = {
  success: boolean;
  customers: CustomerRecord[];
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return customers;
    }

    return customers.filter((customer) =>
      [
        customer.name,
        customer.email,
        customer.company_name ?? "",
        customer.industry ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [customers, query]);

  async function loadCustomers() {
    setIsLoading(true);
    setError("");

    try {
      const response = (await listCustomers()) as CustomersResponse;
      setCustomers(response.customers ?? []);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unexpected error while loading customers",
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
              href="/"
            >
              Back to customer form
            </Link>
            <h1 className="mt-4 text-2xl font-semibold text-slate-950">
              Customers
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Browse local customers and open their related brand profiles and
              posts.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              className="min-w-72 rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              placeholder="Search customers"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button
              className="rounded-md bg-slate-950 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={isLoading}
              onClick={loadCustomers}
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
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Company</th>
                <th className="px-3 py-2">Industry</th>
                <th className="px-3 py-2">Brand profiles</th>
                <th className="px-3 py-2">Posts</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-slate-500" colSpan={7}>
                    No customers loaded.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr className="border-t border-slate-200" key={customer.id}>
                    <td className="px-3 py-2">{customer.id}</td>
                    <td className="px-3 py-2">
                      <Link
                        className="font-medium text-slate-950 underline"
                        href={`/customers/${customer.id}`}
                      >
                        {customer.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{customer.email}</td>
                    <td className="px-3 py-2">{customer.company_name ?? ""}</td>
                    <td className="px-3 py-2">{customer.industry ?? ""}</td>
                    <td className="px-3 py-2">
                      {customer.brand_profile_count ?? 0}
                    </td>
                    <td className="px-3 py-2">{customer.post_count ?? 0}</td>
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
