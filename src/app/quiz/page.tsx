"use client";

import { useMemo, useState } from "react";
import { buildQuestionBank } from "@/lib/metar/questions";

export default function QuizPage() {
  const questions = useMemo(() => buildQuestionBank(), []);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  const q = questions[current];

  const onAnswer = (isCorrect: boolean) => {
    if (answered) return;
    setAnswered(true);
    if (isCorrect) setScore((s) => s + 1);
  };

  const next = () => {
    setAnswered(false);
    setCurrent((c) => (c + 1) % questions.length);
  };

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Quiz</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Score: {score}</p>
      <p className="mt-4">{q.prompt}</p>
      <ul className="mt-4 grid gap-2">
        {q.choices.map((choice) => (
          <button key={choice.id} onClick={() => onAnswer(choice.isCorrect)} className="rounded border p-3 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800">
            {choice.label}
          </button>
        ))}
      </ul>
      <button onClick={next} className="mt-4 rounded bg-sky-500 px-4 py-2 text-white">Next</button>
    </main>
  );
}
