"use client";

import { useState } from "react";
import Link from "next/link";
import { listWorkflowLogs, WorkflowLog } from "@/lib/n8n-client";

type WorkflowLogsResponse = {
  success: boolean;
  logs: WorkflowLog[];
};

export default function WorkflowLogsPage() {
  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadLogs() {
    setIsLoading(true);
    setError("");

    try {
      const response = (await listWorkflowLogs()) as WorkflowLogsResponse;
      setLogs(response.logs ?? []);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unexpected error while loading workflow logs",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <section className="mx-auto w-full max-w-5xl rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              className="text-sm font-medium text-slate-950 underline"
              href="/"
            >
              Back to customer form
            </Link>
            <h1 className="mt-4 text-2xl font-semibold text-slate-950">
              Workflow Logs
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Review recent n8n workflow events saved in MySQL.
            </p>
          </div>

          <button
            className="rounded-md bg-slate-950 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={isLoading}
            onClick={loadLogs}
            type="button"
          >
            {isLoading ? "Loading..." : "Refresh logs"}
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
                <th className="px-3 py-2">Workflow</th>
                <th className="px-3 py-2">Event</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Error</th>
                <th className="px-3 py-2">Created at</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-slate-500" colSpan={6}>
                    No logs loaded.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr className="border-t border-slate-200" key={log.id}>
                    <td className="px-3 py-2">{log.id}</td>
                    <td className="px-3 py-2">{log.workflow_name}</td>
                    <td className="px-3 py-2">{log.event_type}</td>
                    <td className="px-3 py-2">{log.status}</td>
                    <td className="px-3 py-2">{log.error_message ?? ""}</td>
                    <td className="px-3 py-2">{log.created_at}</td>
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
