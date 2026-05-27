"use client";

import { useMemo, useState } from "react";
import { buildQuestionBank } from "@/lib/metar/questions";
import { loadProgress, saveProgress } from "@/lib/storage/progressStorage";

export default function QuizPage() {
  const questions = useMemo(() => buildQuestionBank(), []);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const q = questions[current];

  const onAnswer = (isCorrect: boolean) => {
    if (answered) return;
    setAnswered(true);
    if (isCorrect) setScore((s) => s + 1);

    const existing = loadProgress("local-user");
    saveProgress({
      userId: "local-user",
      totalAnswered: (existing?.totalAnswered ?? 0) + 1,
      totalCorrect: (existing?.totalCorrect ?? 0) + (isCorrect ? 1 : 0),
      updatedAt: new Date().toISOString(),
      skills: existing?.skills ?? [],
    });
  };

  const next = () => {
    setAnswered(false);
    setSelectedId(null);
    setCurrent((c) => (c + 1) % questions.length);
  };

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Quiz</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Score: {score}</p>
      <p className="mt-4">{q.prompt}</p>
      <ul className="mt-4 grid gap-2">
        {q.choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => {
              setSelectedId(choice.id);
              onAnswer(choice.isCorrect);
            }}
            className={`rounded border p-3 text-left transition ${
              !answered
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
      </ul>
      <button onClick={next} className="mt-4 rounded bg-sky-500 px-4 py-2 text-white">Next</button>
    </main>
  );
}
