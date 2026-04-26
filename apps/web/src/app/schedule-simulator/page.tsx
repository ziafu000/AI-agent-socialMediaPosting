"use client";

import { useState } from "react";
import Link from "next/link";
import { runScheduleSimulation } from "@/lib/n8n-client";

export default function ScheduleSimulatorPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState("");

  async function handleRun() {
    setIsRunning(true);
    setResult(null);
    setError("");

    try {
      const response = await runScheduleSimulation();
      setResult(response);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unexpected error while running schedule simulation",
      );
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <section className="mx-auto w-full max-w-3xl rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-6">
          <Link
            className="text-sm font-medium text-slate-950 underline"
            href="/scheduled-posts"
          >
            Back to scheduled posts
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-slate-950">
            Schedule Simulation
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Mark due scheduled posts as published without calling any social
            posting API.
          </p>
        </div>

        <button
          className="w-full rounded-md bg-slate-950 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={isRunning}
          onClick={handleRun}
          type="button"
        >
          {isRunning ? "Running..." : "Run simulation"}
        </button>

        {(result || error) && (
          <pre className="mt-6 overflow-auto rounded-md bg-slate-100 p-4 text-sm text-slate-800">
            {JSON.stringify(result ?? { success: false, message: error }, null, 2)}
          </pre>
        )}
      </section>
    </main>
  );
}
