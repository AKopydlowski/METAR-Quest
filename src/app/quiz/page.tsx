"use client";

import { useMemo, useState } from "react";
import { buildQuestionBank } from "@/lib/metar/questions";
import { recordProgressAnswer } from "@/lib/storage/progressStorage";
import { loadDailyChallenge, saveDailyChallenge, saveLeaderboardEntry } from "@/lib/storage/gameStorage";
import { useLanguage } from "@/components/layout/LanguageProvider";
import type { QuestionDifficulty, QuizChoice } from "@/types/quiz";

const QUIZ_LENGTH = 10;
type DifficultyFilter = "all" | QuestionDifficulty;
type QuizMode = "classic" | "daily" | "endless" | "exam" | "weak";
const SKILLS = ["wind", "visibility", "clouds", "altimeter", "temperature", "weather"] as const;
const MODE_LABELS: Record<QuizMode, string> = { classic: "Klasyczny", daily: "Dzienny", endless: "Bez końca", exam: "Egzamin", weak: "Słaby obszar" };
const SKILL_LABELS: Record<string, string> = { wind: "wiatr", visibility: "widzialność", clouds: "chmury", altimeter: "QNH / altimeter", temperature: "temperatura", weather: "pogoda" };

export default function QuizPage() {
  const { t, language } = useLanguage();
  const initialSkill = typeof window === "undefined" ? "all" : new URLSearchParams(window.location.search).get("skill") ?? "all";
  const [skillFilter, setSkillFilter] = useState<string>(SKILLS.includes(initialSkill as typeof SKILLS[number]) ? initialSkill : "all");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [mode, setMode] = useState<QuizMode>(initialSkill === "all" ? "classic" : "weak");
  const [streak, setStreak] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [hint, setHint] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);


  const allQuestions = useMemo(() => buildQuestionBank(language), [language]);
  const filtered = useMemo(
    () => allQuestions.filter((q) => (difficultyFilter === "all" || q.difficulty === difficultyFilter) && (skillFilter === "all" || q.skillTag === skillFilter)),
    [allQuestions, difficultyFilter, skillFilter],
  );
  const dailySeed = new Date().toISOString().slice(0, 10).split("-").join("");
  const startIdx = Number(dailySeed) % Math.max(filtered.length, 1);
  const questions = useMemo(() => {
    if (mode === "daily") return [...filtered.slice(startIdx), ...filtered.slice(0, startIdx)].slice(0, QUIZ_LENGTH);
    if (mode === "endless" || mode === "weak") return filtered;
    if (mode === "exam") return [...filtered.slice(startIdx), ...filtered.slice(0, startIdx)].slice(0, 25);
    return filtered.slice(0, QUIZ_LENGTH);
  }, [filtered, mode, startIdx]);

  const daily = loadDailyChallenge();

  const q = questions[current % Math.max(questions.length, 1)];
  const selectedChoice = q?.choices.find((choice) => choice.id === selectedId);
  const correctChoice = q?.choices.find((choice) => choice.isCorrect);
  const progress = questions.length ? ((current + 1) / Math.max(questions.length, 1)) * 100 : 0;

  const resetSession = () => {
    setCurrent(0);
    setScore(0);
    setAnswered(false);
    setSelectedId(null);
    setShowResult(false);
    setStreak(0);
    setHintsLeft(3);
    setHint(null);
  };

  const onAnswer = (choice: QuizChoice) => {
    if (answered || !q) return;
    setSelectedId(choice.id);
    setAnswered(true);
    if (choice.isCorrect) {
      setScore((s) => s + 1 + (streak >= 2 ? 1 : 0));
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
    recordProgressAnswer("local-user", "quiz", q.skillTag, choice.isCorrect);
  };

  const next = () => {
    if (!["endless", "weak"].includes(mode) && current >= questions.length - 1) {
      saveLeaderboardEntry("quiz", score);
      if (mode === "daily") saveDailyChallenge({ date: new Date().toISOString().slice(0, 10), score, total: questions.length });
      setShowResult(true);
      return;
    }
    setAnswered(false);
    setSelectedId(null);
    setCurrent((c) => c + 1);
    setHint(null);
  };

  const useHint = () => {
    if (mode === "exam" || hintsLeft <= 0 || answered || !q) return;
    setHintsLeft((h) => h - 1);
    const wrong = q.choices.find((c) => !c.isCorrect);
    setHint(wrong ? `${language === "pl" ? "To na pewno nie jest" : "This is definitely not"}: ${wrong.label}` : null);
  };

  if (!q) {
    return (
      <main className="min-h-screen p-6">
        <section className="mx-auto max-w-4xl rounded-3xl border border-sky-200/20 bg-[var(--surface)]/80 p-6">
          <h1 className="text-3xl font-bold">{mode === "exam" ? (language === "pl" ? "Egzamin METAR" : "METAR Exam") : "Quiz METAR"}</h1>
          <p className="mt-3 text-sm text-slate-300">Brak pytań dla wybranego filtra.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <section className="mx-auto max-w-4xl rounded-3xl border border-sky-200/20 bg-[var(--surface)]/80 p-6 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{mode === "exam" ? (language === "pl" ? "Egzamin METAR" : "METAR Exam") : "Quiz METAR"}</h1>
            <p className="mt-1 text-sm">{t("score")}: {score} | {t("streak")}: {streak} | {mode === "exam" ? (language === "pl" ? "bez podpowiedzi" : "bez podpowiedzi") : `${t("hints")}: ${hintsLeft}`}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-xs uppercase tracking-wide text-slate-400">{t("difficulty")}</span>
              <select value={difficultyFilter} onChange={(event) => { setDifficultyFilter(event.target.value as DifficultyFilter); resetSession(); }} className="w-full rounded border border-slate-500 bg-slate-900 px-3 py-2 text-sm">
                {(["all", "easy", "medium", "hard"] as const).map((level) => <option key={level} value={level}>{t(level)}</option>)}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs uppercase tracking-wide text-slate-400">{language === "pl" ? "Umiejętność" : "Umiejętność"}</span>
              <select value={skillFilter} onChange={(event) => { setSkillFilter(event.target.value); resetSession(); }} className="w-full rounded border border-slate-500 bg-slate-900 px-3 py-2 text-sm">
                <option value="all">{t("all")}</option>
                {SKILLS.map((skill) => <option key={skill} value={skill}>{SKILL_LABELS[skill]}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(["classic", "daily", "endless", "weak", "exam"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); resetSession(); }} className={`rounded px-3 py-1 ${mode === m ? "bg-cyan-400 text-slate-900" : "bg-slate-700 text-white"}`}>{MODE_LABELS[m]}</button>
          ))}
        </div>
        {daily && <p className="mt-2 text-xs text-cyan-200">Misja dzienna ({daily.date}): {daily.score}/{daily.total}</p>}
        <div className="mt-3 h-2 rounded bg-slate-700"><div className="h-2 rounded bg-cyan-400" style={{ width: `${Math.min(progress, 100)}%` }} /></div>

        <article className="mt-5 rounded-2xl border border-slate-700 bg-slate-950/40 p-4">
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wide text-slate-400">
            <span>{t(q.difficulty)}</span>
            <span>•</span>
            <span>{SKILL_LABELS[q.skillTag] ?? q.skillTag}</span>
          </div>
          <p className="mt-3 text-lg font-medium">{q.prompt}</p>
          <p className="mt-3 rounded-xl bg-slate-900 p-3 font-mono text-sm text-cyan-100">{q.metarRaw}</p>
        </article>

        {hint && <p className="mt-3 rounded-xl border border-amber-300/30 bg-amber-400/10 p-3 text-amber-200">{t("hint")}: {hint}</p>}

        <div className="mt-4 grid gap-2">
          {q.choices.map((choice) => {
            const isSelected = selectedId === choice.id;
            const revealCorrect = answered && choice.isCorrect;
            return (
              <button
                key={choice.id}
                disabled={answered}
                onClick={() => onAnswer(choice)}
                className={`rounded-xl border p-3 text-left transition disabled:cursor-not-allowed ${
                  !answered
                    ? "hover:-translate-y-0.5 hover:border-cyan-400"
                    : revealCorrect
                      ? "border-emerald-500 bg-emerald-500/15"
                      : isSelected
                        ? "border-rose-500 bg-rose-500/15"
                        : "opacity-60"
                }`}
              >
                {choice.label}{isSelected ? " ✓" : ""}
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="mt-4 rounded-xl border border-sky-300/20 bg-sky-500/10 p-4 text-sm">
            <p className="font-semibold text-sky-100">{selectedChoice?.isCorrect ? t("correctAnswer") : `${t("correctAnswer")}: ${correctChoice?.label ?? "?"}`}</p>
            <p className="mt-1 text-slate-200"><span className="font-semibold">{t("explanation")}:</span> {selectedChoice?.rationale ?? correctChoice?.rationale}</p>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button onClick={useHint} disabled={mode === "exam" || answered || hintsLeft <= 0} className="rounded bg-amber-400 px-3 py-1 text-slate-900 disabled:opacity-50">{t("hint")}</button>
          <button onClick={next} disabled={!answered} className="rounded bg-cyan-400 px-3 py-1 text-slate-900 disabled:opacity-50">{t("next")}</button>
        </div>
      </section>
      {showResult && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 p-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <p className="text-xl font-semibold">{t("result")}: {score}</p>
            <p className="mt-1 text-sm text-slate-300">{t("answers")}: {mode === "endless" || mode === "weak" ? current + 1 : questions.length}</p>
            {mode === "exam" && <p className="mt-1 text-sm text-slate-300">{language === "pl" ? "Próg zaliczenia" : "Próg zaliczenia"}: 80% • {score >= Math.ceil(questions.length * 0.8) ? "✅" : "❌"}</p>}
            <button className="mt-4 rounded bg-cyan-400 px-3 py-1 text-slate-900" onClick={resetSession}>{t("playAgain")}</button>
          </div>
        </div>
      )}
    </main>
  );
}
