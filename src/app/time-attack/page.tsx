"use client";

import { useEffect, useMemo, useState } from "react";
import { loadProgress, saveProgress } from "@/lib/storage/progressStorage";
import { buildQuestionBank } from "@/lib/metar/questions";
import type { QuizQuestion } from "@/types/quiz";
import { useLanguage } from "@/components/layout/LanguageProvider";

export default function TimeAttackPage() {
  const { t } = useLanguage();
  const localQuestions = useMemo(() => buildQuestionBank(), []);
  const [questions, setQuestions] = useState<QuizQuestion[]>(localQuestions.slice(0, 10));
  const [source, setSource] = useState("local");
  const [timeLeft, setTimeLeft] = useState(60);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/quiz/time-attack")
      .then((res) => res.json())
      .then((data: { source?: string; questions?: QuizQuestion[] }) => {
        if (data.questions?.length) {
          setQuestions(data.questions);
          setSource(data.source ?? "live");
        }
      })
      .catch(() => setSource("local"));
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const q = questions[index % questions.length];

  const chooseAnswer = (choiceId: string, isCorrect: boolean) => {
    if (timeLeft <= 0 || selectedId) return;

    setSelectedId(choiceId);
    setAnswered((n) => n + 1);
    if (isCorrect) {
      const nextCombo = combo + 1;
      const multiplier = nextCombo >= 10 ? 3 : nextCombo >= 5 ? 2 : 1;
      setScore((s) => s + multiplier);
      setCorrect((n) => n + 1);
      setCombo(nextCombo);
      setBestCombo((prev) => Math.max(prev, nextCombo));
    } else {
      setCombo(0);
    }

    const existing = loadProgress("local-user", "time-attack");
    saveProgress(
      {
        userId: "local-user",
        totalAnswered: (existing?.totalAnswered ?? 0) + 1,
        totalCorrect: (existing?.totalCorrect ?? 0) + (isCorrect ? 1 : 0),
        updatedAt: new Date().toISOString(),
        skills: existing?.skills ?? [],
      },
      "time-attack",
    );

    window.setTimeout(() => {
      setIndex((i) => i + 1);
      setSelectedId(null);
    }, 450);
  };

  const restartRound = () => {
    setIndex(0);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setAnswered(0);
    setCorrect(0);
    setSelectedId(null);
    setTimeLeft(60);
  };

  const isFinished = timeLeft <= 0;
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  return (
    <main className="mx-auto w-full max-w-4xl p-6">
      <section className="rounded-2xl border border-sky-200/40 bg-gradient-to-br from-sky-500/15 via-indigo-500/10 to-transparent p-6 shadow-lg backdrop-blur">
        <h1 className="text-3xl font-bold tracking-tight">Time Attack</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{t("questionSource")}: {source === "live-api" ? t("liveApi") : t("localDb")}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border p-3"><p className="text-xs uppercase">{t("time")}</p><p className="text-2xl font-semibold">{Math.max(0, timeLeft)}s</p></div>
          <div className="rounded-xl border p-3"><p className="text-xs uppercase">{t("score")}</p><p className="text-2xl font-semibold">{score}</p></div>
          <div className="rounded-xl border p-3"><p className="text-xs uppercase">Combo</p><p className="text-2xl font-semibold">{combo}🔥</p></div>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border bg-white/80 p-6 shadow-md dark:bg-zinc-900/80">
        {isFinished ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{t("endOfRound")}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("score")}: <span className="font-semibold">{score}</span> pkt</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border p-3"><p className="text-xs uppercase">{t("accuracy")}</p><p className="text-xl font-semibold">{accuracy}%</p></div>
              <div className="rounded-xl border p-3"><p className="text-xs uppercase">{t("bestCombo")}</p><p className="text-xl font-semibold">{bestCombo}</p></div>
              <div className="rounded-xl border p-3"><p className="text-xs uppercase">{t("answers")}</p><p className="text-xl font-semibold">{answered}</p></div>
            </div>
            <button onClick={restartRound} className="rounded-xl bg-sky-500 px-4 py-2 font-semibold text-slate-950 hover:bg-sky-400">{t("playAgain")}</button>
          </div>
        ) : (
          <>
        <p className="text-lg font-medium">{q.prompt}</p>
        <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 dark:border-indigo-500/40 dark:bg-indigo-900/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-200">METAR reference</p>
          <p className="mt-1 font-mono text-sm text-indigo-950 dark:text-indigo-100">{q.metarRaw}</p>
        </div>
        <div className="mt-4 grid gap-2">
          {q.choices.map((choice) => (
            <button
              key={choice.id}
              disabled={timeLeft <= 0 || Boolean(selectedId)}
              onClick={() => chooseAnswer(choice.id, choice.isCorrect)}
              className={`rounded-xl border p-3 text-left transition disabled:opacity-50 ${
                !selectedId
                  ? "hover:-translate-y-0.5 hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-zinc-800"
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
        </>
        )}
      </section>
    </main>
  );
}
