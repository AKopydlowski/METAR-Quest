"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { recordProgressAnswer } from "@/lib/storage/progressStorage";
import { saveLeaderboardEntry } from "@/lib/storage/gameStorage";
import { buildQuestionBank } from "@/lib/metar/questions";
import type { QuizQuestion } from "@/types/quiz";
import { useLanguage } from "@/components/layout/LanguageProvider";

export default function TimeAttackPage() {
  const { t, language } = useLanguage();
  const pl = language === "pl";
  const localQuestions = useMemo(() => buildQuestionBank(language), [language]);
  const [questions, setQuestions] = useState<QuizQuestion[]>(localQuestions.slice(0, 10));
  const [source, setSource] = useState("local");
  const [duration, setDuration] = useState(60);
  const [proMode, setProMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPaused, setIsPaused] = useState(false);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const savedScoreRef = useRef(false);

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
    if (timeLeft <= 0 || isPaused) return;
    const timer = setInterval(() => setTimeLeft((time) => time - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isPaused]);

  useEffect(() => {
    if (timeLeft <= 0 && !savedScoreRef.current) {
      saveLeaderboardEntry("time-attack", score);
      savedScoreRef.current = true;
    }
  }, [timeLeft, score]);

  const q = questions[index % questions.length];
  const selectedChoice = q?.choices.find((choice) => choice.id === selectedId);
  const correctChoice = q?.choices.find((choice) => choice.isCorrect);

  const chooseAnswer = (choiceId: string, isCorrect: boolean) => {
    if (timeLeft <= 0 || selectedId || isPaused || !q) return;

    setSelectedId(choiceId);
    setAnswered((n) => n + 1);
    if (isCorrect) {
      const nextCombo = combo + 1;
      const multiplier = nextCombo >= 10 ? 3 : nextCombo >= 5 ? 2 : 1;
      const speedBonus = timeLeft > duration * 0.75 ? 1 : 0;
      setScore((s) => s + multiplier + speedBonus);
      setCorrect((n) => n + 1);
      setCombo(nextCombo);
      setBestCombo((prev) => Math.max(prev, nextCombo));
    } else {
      setCombo(0);
      if (proMode) setTimeLeft((time) => Math.max(0, time - 3));
    }

    recordProgressAnswer("local-user", "time-attack", q.skillTag, isCorrect);

    window.setTimeout(() => {
      setIndex((i) => i + 1);
      setSelectedId(null);
    }, 650);
  };

  const restartRound = (nextDuration = duration) => {
    setDuration(nextDuration);
    setIndex(0);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setAnswered(0);
    setCorrect(0);
    setSelectedId(null);
    setIsPaused(false);
    savedScoreRef.current = false;
    setTimeLeft(nextDuration);
  };

  const isFinished = timeLeft <= 0;
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
  const multiplier = combo >= 10 ? 3 : combo >= 5 ? 2 : 1;
  const rank = score >= 35 ? "Ace" : score >= 22 ? "Gold" : score >= 12 ? "Silver" : "Bronze";

  return (
    <div className="w-full space-y-5">
      <section className="overflow-hidden rounded-[2rem] border border-sky-300/20 bg-slate-950/80 p-6 text-white shadow-2xl shadow-sky-950/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">{pl ? "Trener arcade" : "Arcade trainer"}</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">Time Attack</h1>
            <p className="mt-2 text-sm text-slate-300">{t("questionSource")}: {source === "live-api" ? t("liveApi") : t("localDb")}</p>
          </div>
          <label className="text-sm">
            <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("duration")}</span>
            <select value={duration} onChange={(event) => restartRound(Number(event.target.value))} className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-white">
              {[30, 60, 120].map((seconds) => <option key={seconds} value={seconds}>{seconds}s</option>)}
            </select>
          </label>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs uppercase text-slate-400">{t("time")}</p><p className="text-3xl font-black">{Math.max(0, timeLeft)}s</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs uppercase text-slate-400">{t("score")}</p><p className="text-3xl font-black">{score}</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs uppercase text-slate-400">Combo</p><p className="text-3xl font-black">{combo}🔥</p></div>
          <div className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-4"><p className="text-xs uppercase text-cyan-200">Multiplier</p><p className="text-3xl font-black">x{multiplier}</p></div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => setIsPaused((paused) => !paused)} disabled={isFinished} className="rounded-xl border border-sky-300/40 px-4 py-2 text-sm font-semibold disabled:opacity-50">
            {isPaused ? t("resume") : t("pause")}
          </button>
          <button onClick={() => setProMode((value) => !value)} className={`rounded-xl border px-4 py-2 text-sm font-semibold ${proMode ? "border-rose-300 bg-rose-500/20 text-rose-100" : "border-slate-500"}`}>Pro mode {proMode ? "ON" : "OFF"}</button>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-500/30 bg-[var(--surface)]/90 p-6 shadow-xl">
        {isFinished ? (
          <div className="space-y-4">
            <h2 className="text-3xl font-black">{t("endOfRound")} — {rank}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("score")}: <span className="font-semibold">{score}</span> pkt</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border p-3"><p className="text-xs uppercase">{t("accuracy")}</p><p className="text-xl font-semibold">{accuracy}%</p></div>
              <div className="rounded-xl border p-3"><p className="text-xs uppercase">{t("bestCombo")}</p><p className="text-xl font-semibold">{bestCombo}</p></div>
              <div className="rounded-xl border p-3"><p className="text-xs uppercase">{t("answers")}</p><p className="text-xl font-semibold">{answered}</p></div>
            </div>
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4"><p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Share card</p><p className="mt-2 font-mono text-sm">METAR Quest Time Attack: {score} pts, {accuracy}% accuracy, {bestCombo} best combo, rank {rank}.</p></div>
            {accuracy === 100 && answered > 0 && <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm font-bold">🏅 Perfect streak badge unlocked</div>}
            <button onClick={() => restartRound()} className="rounded-xl bg-sky-500 px-4 py-2 font-semibold text-slate-950 hover:bg-sky-400">{t("playAgain")}</button>
          </div>
        ) : isPaused ? (
          <div className="rounded-xl border border-amber-300/30 bg-amber-400/10 p-6 text-center">
            <h2 className="text-2xl font-bold">{t("pause")}</h2>
            <button onClick={() => setIsPaused(false)} className="mt-4 rounded-xl bg-sky-500 px-4 py-2 font-semibold text-slate-950">{t("resume")}</button>
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
                  className={`rounded-xl border p-3 text-left transition disabled:opacity-80 ${
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
            {selectedChoice && (
              <div className="mt-4 rounded-xl border border-sky-300/20 bg-sky-500/10 p-3 text-sm">
                <p className="font-semibold">{selectedChoice.isCorrect ? t("correctAnswer") : `${t("correctAnswer")}: ${correctChoice?.label ?? "?"}`}</p>
                <p className="mt-1">{selectedChoice.rationale ?? correctChoice?.rationale}</p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
