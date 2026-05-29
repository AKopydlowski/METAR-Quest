"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { buildQuestionBank } from "@/lib/metar/questions";
import { recordProgressAnswer } from "@/lib/storage/progressStorage";
import { saveLeaderboardEntry } from "@/lib/storage/gameStorage";
import { useLanguage } from "@/components/layout/LanguageProvider";
import type { QuizChoice } from "@/types/quiz";

const EXAM_LENGTH = 25;
const PASS_MARK = 80;

export default function ExamPage() {
  const { language } = useLanguage();
  const pl = language === "pl";
  const questions = useMemo(() => buildQuestionBank(language).slice(0, EXAM_LENGTH), [language]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const q = questions[current];
  const percent = Math.round((score / Math.max(questions.length, 1)) * 100);

  const answer = (choice: QuizChoice) => {
    if (selectedId || finished) return;
    setSelectedId(choice.id);
    if (choice.isCorrect) setScore((value) => value + 1);
    recordProgressAnswer("local-user", "exam", q.skillTag, choice.isCorrect);
  };

  const next = () => {
    if (current >= questions.length - 1) {
      saveLeaderboardEntry("exam", percent);
      setFinished(true);
      return;
    }
    setCurrent((value) => value + 1);
    setSelectedId(null);
  };

  const restart = () => {
    setCurrent(0);
    setScore(0);
    setSelectedId(null);
    setFinished(false);
  };

  if (!q) return null;

  return (
    <div className="w-full space-y-6">
      <section className="rounded-[2rem] border border-violet-300/20 bg-slate-950/80 p-6 text-white shadow-2xl shadow-violet-950/30">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-200">{pl ? "Tryb egzaminacyjny" : "Exam mode"}</p>
        <h1 className="mt-2 text-4xl font-black">{pl ? "Egzamin METAR / TAF" : "METAR / TAF Exam"}</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-300">{pl ? "25 pytań, brak podpowiedzi, próg zaliczenia 80%. Wynik zapisuje się w progresie i leaderboardzie." : "25 questions, no hints, 80% pass mark. The result is saved to progress and leaderboard."}</p>
      </section>

      <section className="rounded-3xl border border-slate-500/30 bg-[var(--surface)]/90 p-6 shadow-xl">
        {finished ? (
          <div className="space-y-4">
            <h2 className="text-3xl font-black">{percent >= PASS_MARK ? (pl ? "Zdane" : "Passed") : (pl ? "Do poprawy" : "Needs review")}: {percent}%</h2>
            <p>{score}/{questions.length} • {pl ? "próg" : "pass mark"} {PASS_MARK}%</p>
            <div className="flex flex-wrap gap-2"><button onClick={restart} className="rounded-xl bg-violet-400 px-4 py-2 font-black text-slate-950">{pl ? "Podejdź ponownie" : "Retake"}</button><Link href="/progress" className="rounded-xl border border-violet-300/40 px-4 py-2 font-bold">{pl ? "Analiza postępu" : "Progress analysis"}</Link></div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3"><p className="text-sm font-bold">{current + 1}/{questions.length}</p><p className="text-sm">{pl ? "Wynik" : "Score"}: {score}</p></div>
            <div className="mt-3 h-2 rounded bg-slate-700"><div className="h-2 rounded bg-violet-400" style={{ width: `${((current + 1) / questions.length) * 100}%` }} /></div>
            <article className="mt-5 rounded-2xl border border-slate-700 bg-slate-950/40 p-4"><p className="text-xs uppercase tracking-wide text-slate-400">{q.skillTag} • {q.difficulty}</p><p className="mt-3 text-lg font-semibold">{q.prompt}</p><p className="mt-3 rounded-xl bg-slate-900 p-3 font-mono text-sm text-cyan-100">{q.metarRaw}</p></article>
            <div className="mt-4 grid gap-2">{q.choices.map((choice) => <button key={choice.id} disabled={Boolean(selectedId)} onClick={() => answer(choice)} className={`rounded-xl border p-3 text-left ${selectedId && choice.isCorrect ? "border-emerald-400 bg-emerald-500/15" : selectedId === choice.id ? "border-rose-400 bg-rose-500/15" : "hover:border-violet-300"}`}>{choice.label}</button>)}</div>
            {selectedId && <button onClick={next} className="mt-4 rounded-xl bg-violet-400 px-4 py-2 font-black text-slate-950">{current >= questions.length - 1 ? (pl ? "Zakończ" : "Finish") : (pl ? "Następne" : "Next")}</button>}
          </>
        )}
      </section>
    </div>
  );
}
