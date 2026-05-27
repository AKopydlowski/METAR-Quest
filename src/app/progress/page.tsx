"use client";

import { useMemo } from "react";
import { loadProgress } from "@/lib/storage/progressStorage";

export default function ProgressPage() {
  const progress = useMemo(() => loadProgress("local-user"), []);
  const accuracy = progress && progress.totalAnswered > 0 ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100) : 0;

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Progress</h1>
      {!progress ? (
        <p className="mt-3 text-zinc-600 dark:text-zinc-300">No progress yet. Complete quiz/time attack to build stats.</p>
      ) : (
        <div className="mt-4 grid gap-2 text-sm">
          <p><strong>Answered:</strong> {progress.totalAnswered}</p>
          <p><strong>Correct:</strong> {progress.totalCorrect}</p>
          <p><strong>Accuracy:</strong> {accuracy}%</p>
          <p><strong>Last update:</strong> {new Date(progress.updatedAt).toLocaleString()}</p>
        </div>
      )}
    </main>
  );
}
