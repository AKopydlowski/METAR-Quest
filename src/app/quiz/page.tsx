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
  const progress = ((current + 1) / questions.length) * 100;

  const onAnswer = (isCorrect: boolean) => {
    if (answered) return;
    setAnswered(true);
    if (isCorrect) setScore((s) => s + 1);

    const existing = loadProgress("local-user", "quiz");
    saveProgress(
      {
        userId: "local-user",
        totalAnswered: (existing?.totalAnswered ?? 0) + 1,
        totalCorrect: (existing?.totalCorrect ?? 0) + (isCorrect ? 1 : 0),
        updatedAt: new Date().toISOString(),
        skills: existing?.skills ?? [],
      },
      "quiz",
    );
  };

  const next = () => {
    setAnswered(false);
    setSelectedId(null);
    setCurrent((c) => (c + 1) % questions.length);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 text-slate-100 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_50%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.18),_transparent_45%)]" />
      <section className="relative mx-auto w-full max-w-4xl rounded-3xl border border-sky-200/20 bg-slate-900/70 p-6 shadow-2xl backdrop-blur sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">METAR Quiz</h1>
            <p className="mt-1 text-sm text-sky-100/80">Score: {score}</p>
          </div>
          <span className="rounded-full border border-sky-300/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-200">
            {q.difficulty}
          </span>
        </div>

        <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-700/70">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs font-medium uppercase tracking-widest text-slate-300">
          Question {current + 1} / {questions.length}
        </p>
        <p className="mt-3 text-xl font-semibold leading-relaxed text-white">{q.prompt}</p>

        <div className="mt-5 rounded-2xl border border-violet-300/30 bg-slate-950/70 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-violet-200">METAR reference</p>
          <p className="font-mono text-sm leading-relaxed text-violet-100">{q.metarRaw}</p>
        </div>

        <ul className="mt-6 grid gap-3">
          {q.choices.map((choice, index) => (
            <button
              key={choice.id}
              onClick={() => {
                setSelectedId(choice.id);
                onAnswer(choice.isCorrect);
              }}
              className={`w-full rounded-2xl border p-4 text-left text-lg transition-all duration-300 ease-out [animation:fadeIn_420ms_ease-out] ${
                !answered
                  ? "border-slate-500/60 bg-slate-900/70 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-slate-800"
                  : choice.isCorrect
                    ? "border-emerald-400 bg-emerald-500/15 text-emerald-100"
                    : selectedId === choice.id
                      ? "border-rose-400 bg-rose-500/15 text-rose-100"
                      : "border-slate-700/80 bg-slate-900/50 text-slate-400"
              }`}
              style={{ animationDelay: `${index * 70}ms` }}
            >
              {choice.label}
            </button>
          ))}
        </ul>

        <button
          onClick={next}
          className="mt-7 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-6 py-2.5 font-semibold text-slate-950 transition hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/30"
        >
          Next Question
        </button>
      </section>
    </main>
  );
}
