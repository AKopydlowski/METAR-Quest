"use client";

import { useMemo } from "react";
import { loadProgress } from "@/lib/storage/progressStorage";

export default function ProgressPage() {
  const quizProgress = useMemo(() => loadProgress("local-user", "quiz"), []);
  const timeAttackProgress = useMemo(() => loadProgress("local-user", "time-attack"), []);
  const quizAccuracy =
    quizProgress && quizProgress.totalAnswered > 0
      ? Math.round((quizProgress.totalCorrect / quizProgress.totalAnswered) * 100)
      : 0;
  const timeAttackAccuracy =
    timeAttackProgress && timeAttackProgress.totalAnswered > 0
      ? Math.round((timeAttackProgress.totalCorrect / timeAttackProgress.totalAnswered) * 100)
      : 0;

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Progress</h1>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900/60">
          <h2 className="font-semibold">Quiz</h2>
          {!quizProgress ? (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">No quiz progress yet.</p>
          ) : (
            <div className="mt-2 grid gap-1 text-sm">
              <p><strong>Answered:</strong> {quizProgress.totalAnswered}</p>
              <p><strong>Correct:</strong> {quizProgress.totalCorrect}</p>
              <p><strong>Accuracy:</strong> {quizAccuracy}%</p>
              <p><strong>Last update:</strong> {new Date(quizProgress.updatedAt).toLocaleString()}</p>
            </div>
          )}
        </section>
        <section className="rounded-lg border border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900/60">
          <h2 className="font-semibold">Time Attack</h2>
          {!timeAttackProgress ? (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">No time attack progress yet.</p>
          ) : (
            <div className="mt-2 grid gap-1 text-sm">
              <p><strong>Answered:</strong> {timeAttackProgress.totalAnswered}</p>
              <p><strong>Correct:</strong> {timeAttackProgress.totalCorrect}</p>
              <p><strong>Accuracy:</strong> {timeAttackAccuracy}%</p>
              <p><strong>Last update:</strong> {new Date(timeAttackProgress.updatedAt).toLocaleString()}</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
