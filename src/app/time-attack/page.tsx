"use client";

import { useEffect, useMemo, useState } from "react";
import { buildQuestionBank } from "@/lib/metar/questions";
import { loadProgress, saveProgress } from "@/lib/storage/progressStorage";

export default function TimeAttackPage() {
  const questions = useMemo(() => buildQuestionBank(), []);
  const [timeLeft, setTimeLeft] = useState(60);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const q = questions[index % questions.length];

  const chooseAnswer = (choiceId: string, isCorrect: boolean) => {
    if (timeLeft <= 0 || selectedId) return;

    setSelectedId(choiceId);
    if (isCorrect) setScore((s) => s + 1);

    const existing = loadProgress("local-user");
    saveProgress({
      userId: "local-user",
      totalAnswered: (existing?.totalAnswered ?? 0) + 1,
      totalCorrect: (existing?.totalCorrect ?? 0) + (isCorrect ? 1 : 0),
      updatedAt: new Date().toISOString(),
      skills: existing?.skills ?? [],
    });

    window.setTimeout(() => {
      setIndex((i) => i + 1);
      setSelectedId(null);
    }, 450);
  };

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Time Attack</h1>
      <p className="mt-2">Time left: {timeLeft}s | Score: {score}</p>
      <p className="mt-4">{q.prompt}</p>
      <div className="mt-4 grid gap-2">
        {q.choices.map((choice) => (
          <button
            key={choice.id}
            disabled={timeLeft <= 0 || Boolean(selectedId)}
            onClick={() => chooseAnswer(choice.id, choice.isCorrect)}
            className={`rounded border p-3 text-left transition disabled:opacity-50 ${
              !selectedId
                ? "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                : choice.isCorrect
                  ? "border-emerald-500 bg-emerald-500/10"
                  : selectedId === choice.id
                    ? "border-rose-500 bg-rose-500/10"
                    : "opacity-70"
            }`}
          >
            {choice.label}
          </button>
        ))}
      </div>
    </main>
  );
}
