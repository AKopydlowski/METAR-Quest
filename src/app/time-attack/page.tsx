"use client";

import { useEffect, useMemo, useState } from "react";
import { buildQuestionBank } from "@/lib/metar/questions";

export default function TimeAttackPage() {
  const questions = useMemo(() => buildQuestionBank(), []);
  const [timeLeft, setTimeLeft] = useState(60);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const q = questions[index % questions.length];

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Time Attack</h1>
      <p className="mt-2">Time left: {timeLeft}s | Score: {score}</p>
      <p className="mt-4">{q.prompt}</p>
      <div className="mt-4 grid gap-2">
        {q.choices.map((choice) => (
          <button
            key={choice.id}
            disabled={timeLeft <= 0}
            onClick={() => {
              if (choice.isCorrect) setScore((s) => s + 1);
              setIndex((i) => i + 1);
            }}
            className="rounded border p-3 text-left hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-800"
          >
            {choice.label}
          </button>
        ))}
      </div>
    </main>
  );
}
