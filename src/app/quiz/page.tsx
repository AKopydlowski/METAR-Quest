"use client";

import { useEffect, useMemo, useState } from "react";
import { buildQuestionBank } from "@/lib/metar/questions";
import { loadProgress, saveProgress } from "@/lib/storage/progressStorage";
import { loadDailyChallenge, saveDailyChallenge, saveLeaderboardEntry } from "@/lib/storage/gameStorage";

const QUIZ_LENGTH = 10;
type DifficultyFilter = "all" | "easy" | "medium" | "hard";
type QuizMode = "classic" | "daily" | "endless";

export default function QuizPage() {
  const [difficultyFilter] = useState<DifficultyFilter>("all");
  const [mode, setMode] = useState<QuizMode>("classic");
  const [streak, setStreak] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [hint, setHint] = useState<string | null>(null);
  const allQuestions = useMemo(() => buildQuestionBank(), []);
  const filtered = useMemo(() => allQuestions.filter((q) => difficultyFilter === "all" ? true : q.difficulty === difficultyFilter), [allQuestions, difficultyFilter]);
  const dailySeed = new Date().toISOString().slice(0, 10).split("-").join("");
  const startIdx = Number(dailySeed) % Math.max(filtered.length, 1);
  const questions = useMemo(() => {
    if (mode === "daily") return [...filtered.slice(startIdx), ...filtered.slice(0, startIdx)].slice(0, QUIZ_LENGTH);
    if (mode === "endless") return filtered;
    return filtered.slice(0, QUIZ_LENGTH);
  }, [filtered, mode, startIdx]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (showResult) {
      saveLeaderboardEntry("quiz", score);
      if (mode === "daily") saveDailyChallenge({ date: new Date().toISOString().slice(0, 10), score, total: questions.length });
    }
  }, [showResult, score, mode, questions.length]);

  const q = questions[current % questions.length];
  const progress = questions.length ? ((current + 1) / Math.max(questions.length, 1)) * 100 : 0;

  const resetSession = () => { setCurrent(0); setScore(0); setAnswered(false); setSelectedId(null); setShowResult(false); setStreak(0); setHintsLeft(3); setHint(null); };

  const onAnswer = (isCorrect: boolean) => {
    if (answered) return;
    setAnswered(true);
    if (isCorrect) { setScore((s) => s + 1 + (streak >= 2 ? 1 : 0)); setStreak((s) => s + 1); } else setStreak(0);
    const existing = loadProgress("local-user", "quiz");
    saveProgress({ userId: "local-user", totalAnswered: (existing?.totalAnswered ?? 0) + 1, totalCorrect: (existing?.totalCorrect ?? 0) + (isCorrect ? 1 : 0), updatedAt: new Date().toISOString(), skills: existing?.skills ?? [] }, "quiz");
  };

  const next = () => {
    if (mode !== "endless" && current >= questions.length - 1) return setShowResult(true);
    setAnswered(false); setSelectedId(null); setCurrent((c) => c + 1); setHint(null);
  };

  const useHint = () => {
    if (hintsLeft <= 0 || answered) return;
    setHintsLeft((h) => h - 1);
    const wrong = q.choices.find((c) => !c.isCorrect);
    setHint(wrong ? `To na pewno nie jest: ${wrong.label}` : null);
  };

  const daily = loadDailyChallenge();
  return <main className="min-h-screen bg-slate-950 p-6 text-slate-100"><section className="mx-auto max-w-4xl rounded-3xl border border-sky-200/20 bg-slate-900/70 p-6">
    <h1 className="text-3xl font-bold">METAR Quiz</h1><p className="mt-1 text-sm">Score: {score} | Streak: {streak} | Hints: {hintsLeft}</p>
    <div className="mt-3 flex gap-2">{(["classic","daily","endless"] as const).map((m)=><button key={m} onClick={()=>{setMode(m);resetSession();}} className={`rounded px-3 py-1 ${mode===m?"bg-cyan-400 text-slate-900":"bg-slate-700"}`}>{m}</button>)}</div>
    {daily && <p className="mt-2 text-xs text-cyan-200">Daily ({daily.date}): {daily.score}/{daily.total}</p>}
    <div className="mt-3 h-2 rounded bg-slate-700"><div className="h-2 rounded bg-cyan-400" style={{width:`${Math.min(progress,100)}%`}}/></div>
    <p className="mt-3">{q.prompt}</p><p className="mt-2 font-mono text-sm">{q.metarRaw}</p>
    {hint && <p className="mt-2 text-amber-300">Hint: {hint}</p>}
    <div className="mt-4 grid gap-2">{q.choices.map((c)=><button key={c.id} onClick={()=>{setSelectedId(c.id);onAnswer(c.isCorrect);}} className="rounded border p-3 text-left">{c.label}{selectedId===c.id?" ✓":""}</button>)}</div>
    <div className="mt-4 flex gap-2"><button onClick={useHint} className="rounded bg-amber-400 px-3 py-1 text-slate-900">Podpowiedź</button><button onClick={next} disabled={!answered} className="rounded bg-cyan-400 px-3 py-1 text-slate-900">Następne</button></div>
  </section>
  {showResult && <div className="fixed inset-0 flex items-center justify-center bg-black/60"><div className="rounded bg-slate-900 p-6"><p>Wynik: {score}</p><button className="mt-2 rounded bg-cyan-400 px-3 py-1 text-slate-900" onClick={resetSession}>Jeszcze raz</button></div></div>}
  </main>;
}
