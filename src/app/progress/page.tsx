"use client";

import { ChangeEvent, useState } from "react";
import Link from "next/link";
import { exportProgressBundle, importProgressBundle, loadProgress } from "@/lib/storage/progressStorage";
import { getAchievements, loadLeaderboard } from "@/lib/storage/gameStorage";
import { buildTrainingPlan, getPilotRank } from "@/lib/metar/briefing";
import { buildQuestionBank } from "@/lib/metar/questions";
import { getNextRecommendedDrill, getSkillMastery } from "@/lib/training/adaptive";
import { useLanguage } from "@/components/layout/LanguageProvider";
import type { SkillProgress } from "@/types/progress";

function skillAccuracy(skill: SkillProgress) {
  const total = skill.correct + skill.incorrect;
  return total > 0 ? Math.round((skill.correct / total) * 100) : 0;
}

export default function ProgressPage() {
  const { t, language } = useLanguage();
  const pl = language === "pl";
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const quizProgress = loadProgress("local-user", "quiz");
  const timeAttackProgress = loadProgress("local-user", "time-attack");
  const missionProgress = loadProgress("local-user", "mission");
  const examProgress = loadProgress("local-user", "exam");
  const leaderboard = loadLeaderboard();
  const quizAccuracy = quizProgress && quizProgress.totalAnswered > 0 ? Math.round((quizProgress.totalCorrect / quizProgress.totalAnswered) * 100) : 0;
  const timeAttackAccuracy = timeAttackProgress && timeAttackProgress.totalAnswered > 0 ? Math.round((timeAttackProgress.totalCorrect / timeAttackProgress.totalAnswered) * 100) : 0;
  const bestTimeAttack = Math.max(...leaderboard.filter((x) => x.mode === "time-attack").map((x) => x.score), 0);
  const totalAnswered = (quizProgress?.totalAnswered ?? 0) + (timeAttackProgress?.totalAnswered ?? 0) + (missionProgress?.totalAnswered ?? 0) + (examProgress?.totalAnswered ?? 0);
  const blendedAccuracy = totalAnswered ? Math.round((((quizProgress?.totalCorrect ?? 0) + (timeAttackProgress?.totalCorrect ?? 0) + (missionProgress?.totalCorrect ?? 0) + (examProgress?.totalCorrect ?? 0)) / totalAnswered) * 100) : 0;
  const achievements = getAchievements({ quizAccuracy, totalAnswered, bestTimeAttack });
  const allSkills = [...(quizProgress?.skills ?? []), ...(timeAttackProgress?.skills ?? []), ...(missionProgress?.skills ?? []), ...(examProgress?.skills ?? [])].reduce<Record<string, SkillProgress>>((acc, skill) => {
    const existing = acc[skill.skillTag] ?? { skillTag: skill.skillTag, correct: 0, incorrect: 0, streak: 0 };
    const latestAnswered = [existing.lastAnsweredAt, skill.lastAnsweredAt].filter(Boolean).sort().at(-1);
    const latestReview = [existing.nextReviewAt, skill.nextReviewAt].filter(Boolean).sort().at(-1);
    acc[skill.skillTag] = {
      skillTag: skill.skillTag,
      correct: existing.correct + skill.correct,
      incorrect: existing.incorrect + skill.incorrect,
      streak: Math.max(existing.streak, skill.streak),
      attempts: (existing.attempts ?? existing.correct + existing.incorrect) + (skill.attempts ?? skill.correct + skill.incorrect),
      lastAnsweredAt: latestAnswered,
      nextReviewAt: latestReview,
      ease: Math.max(existing.ease ?? 0, skill.ease ?? 0) || undefined,
    };
    return acc;
  }, {});
  const skills = Object.values(allSkills).sort((a, b) => skillAccuracy(a) - skillAccuracy(b));
  const weakest = skills[0];
  const rank = getPilotRank({ totalAnswered, accuracy: blendedAccuracy, bestTimeAttack });
  const trainingPlan = buildTrainingPlan(skills);
  const mastery = getSkillMastery({ userId: "local-user", totalAnswered, totalCorrect: (quizProgress?.totalCorrect ?? 0) + (timeAttackProgress?.totalCorrect ?? 0) + (missionProgress?.totalCorrect ?? 0) + (examProgress?.totalCorrect ?? 0), updatedAt: new Date().toISOString(), skills });
  const recommendation = getNextRecommendedDrill(quizProgress, buildQuestionBank(language));
  const shareText = `METAR Quest — ${rank.rank}: ${blendedAccuracy}% accuracy, ${totalAnswered} answers, best Time Attack ${bestTimeAttack}.`;

  const exportProgress = () => {
    const blob = new Blob([exportProgressBundle()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "metar-quest-progress.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importProgress = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const ok = importProgressBundle(await file.text());
    setImportStatus(ok ? (pl ? "Zaimportowano postęp." : "Progress imported.") : (pl ? "Nie udało się zaimportować pliku." : "Could not import file."));
    if (ok) window.location.reload();
  };

  return (
    <div className="w-full space-y-5">
      <section className="rounded-[2rem] border border-sky-300/20 bg-slate-950/80 p-6 text-white shadow-2xl shadow-sky-950/30">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="rounded-3xl bg-gradient-to-br from-cyan-300 via-sky-300 to-indigo-300 p-6 text-slate-950">
            <p className="text-xs font-black uppercase tracking-[0.26em] opacity-70">{pl ? "Ranga pilota" : "Pilot rank"}</p>
            <h1 className="mt-3 text-5xl font-black tracking-tight">{rank.rank}</h1>
            <div className="mt-5 h-4 rounded-full bg-slate-950/20">
              <div className="h-4 rounded-full bg-slate-950" style={{ width: `${Math.min(100, rank.progress)}%` }} />
            </div>
            <p className="mt-3 text-sm font-bold">{rank.next}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">{pl ? "Profil i plan treningu" : "Profile & training plan"}</p>
            <h2 className="mt-2 text-4xl font-black">{pl ? "Twój instruktor meteo" : "Your weather instructor"}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              {pl ? "Aplikacja analizuje quiz, Time Attack i słabe obszary, a potem zamienia postęp w konkretny plan treningowy." : "The app analyzes quiz, Time Attack and weak areas, then turns progress into a concrete training plan."}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("answers")}</p><p className="text-3xl font-black">{totalAnswered}</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{t("accuracy")}</p><p className="text-3xl font-black">{blendedAccuracy}%</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">Best TA</p><p className="text-3xl font-black">{bestTimeAttack}</p></div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <section className="rounded-3xl border border-sky-300/20 bg-[var(--surface)]/90 p-5 shadow-xl"><h2 className="font-semibold">Quiz</h2><p>Answered: {quizProgress?.totalAnswered ?? 0}</p><p>{t("accuracy")}: {quizAccuracy}%</p></section>
        <section className="rounded-3xl border border-sky-300/20 bg-[var(--surface)]/90 p-5 shadow-xl"><h2 className="font-semibold">Time Attack</h2><p>Answered: {timeAttackProgress?.totalAnswered ?? 0}</p><p>{t("accuracy")}: {timeAttackAccuracy}%</p></section>
        <section className="rounded-3xl border border-sky-300/20 bg-[var(--surface)]/90 p-5 shadow-xl"><h2 className="font-semibold">Missions</h2><p>Answered: {missionProgress?.totalAnswered ?? 0}</p><p>{t("accuracy")}: {missionProgress?.totalAnswered ? Math.round(((missionProgress?.totalCorrect ?? 0) / missionProgress.totalAnswered) * 100) : 0}%</p></section>
        <section className="rounded-3xl border border-sky-300/20 bg-[var(--surface)]/90 p-5 shadow-xl"><h2 className="font-semibold">Exam</h2><p>Answered: {examProgress?.totalAnswered ?? 0}</p><p>{t("accuracy")}: {examProgress?.totalAnswered ? Math.round(((examProgress?.totalCorrect ?? 0) / examProgress.totalAnswered) * 100) : 0}%</p></section>
      </div>

      <section className="rounded-3xl border border-emerald-300/20 bg-emerald-500/10 p-5 shadow-xl">
        <h2 className="text-xl font-bold">{pl ? "Dzisiejszy plan treningu" : "Today’s training plan"}</h2>
        <ol className="mt-4 grid gap-3 md:grid-cols-3">
          {trainingPlan.map((item, index) => <li key={item} className="rounded-2xl border border-white/10 bg-black/15 p-4"><span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Step {index + 1}</span><p className="mt-2 text-sm">{item}</p></li>)}
        </ol>
        <div className="mt-4 flex flex-wrap gap-2"><Link href="/missions" className="inline-flex rounded-xl bg-emerald-400 px-4 py-2 text-sm font-black text-slate-950 hover:bg-emerald-300">{pl ? "Daily Live Mission" : "Daily Live Mission"}</Link><Link href={weakest ? `/quiz?skill=${encodeURIComponent(weakest.skillTag)}` : "/quiz"} className="inline-flex rounded-xl border border-emerald-300/40 px-4 py-2 text-sm font-bold text-emerald-200 hover:bg-emerald-500/10">{pl ? "Ćwicz słaby obszar" : "Drill weak area"}</Link></div>
      </section>

      <section className="rounded-3xl border border-cyan-300/20 bg-cyan-500/10 p-5 shadow-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold">{pl ? "Adaptive Training 2.0" : "Adaptive Training 2.0"}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{recommendation.reason}</p>
          </div>
          <Link href={recommendation.href} className="inline-flex rounded-xl bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950 hover:bg-cyan-300">{pl ? "Start rekomendowanego drillu" : "Start recommended drill"}</Link>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {mastery.length ? mastery.slice(0, 6).map((item) => (
            <article key={item.skillTag} className="rounded-2xl border border-white/10 bg-black/15 p-4">
              <div className="flex items-center justify-between gap-3"><h3 className="font-bold capitalize">{item.skillTag}</h3><span className="text-xs font-black uppercase">P{item.priority}</span></div>
              <div className="mt-3 h-2 rounded bg-slate-700"><div className="h-2 rounded bg-cyan-300" style={{ width: `${item.mastery}%` }} /></div>
              <p className="mt-2 text-xs text-slate-400">Mastery {item.mastery}% • accuracy {item.accuracy}% • {item.due ? (pl ? "do powtórki" : "due") : (pl ? "zaplanowane" : "scheduled")}</p>
            </article>
          )) : <p className="text-sm">{pl ? "Zrób kilka pytań, aby odblokować model mastery." : "Answer a few questions to unlock the mastery model."}</p>}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-500/30 bg-[var(--surface)]/90 p-5 shadow-xl">
        <h2 className="font-semibold">{t("weakAreas")}</h2>
        {skills.length ? (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {skills.map((skill) => {
              const accuracy = skillAccuracy(skill);
              return (
                <article key={skill.skillTag} className="rounded-xl border border-slate-500/30 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold capitalize">{skill.skillTag}</h3>
                    <span className="text-sm">{accuracy}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded bg-zinc-200 dark:bg-zinc-800"><div className="h-2 rounded bg-sky-500" style={{ width: `${accuracy}%` }} /></div>
                  <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">✓ {skill.correct} / ✕ {skill.incorrect} / streak {skill.streak}</p>
                </article>
              );
            })}
          </div>
        ) : <p className="mt-2 text-sm">{pl ? "Brak danych — zacznij od quizu albo Time Attack." : "No skill data yet — start with Quiz or Time Attack."}</p>}
        {weakest && <p className="mt-4 rounded-xl bg-amber-400/10 p-3 text-sm"><strong>{t("recommendedPractice")}:</strong> focus on {weakest.skillTag} questions first.</p>}
      </section>

      <section className="rounded-3xl border border-sky-300/20 bg-sky-500/10 p-5 shadow-xl">
        <h2 className="text-xl font-bold">{pl ? "Eksport / import postępu" : "Export / import progress"}</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{pl ? "Przenieś lokalny profil na inne urządzenie bez konta w chmurze." : "Move your local profile to another device without a cloud account."}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={exportProgress} className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950">{pl ? "Eksportuj JSON" : "Export JSON"}</button>
          <label className="cursor-pointer rounded-xl border border-cyan-300/40 px-4 py-2 text-sm font-bold text-cyan-200">
            {pl ? "Importuj JSON" : "Import JSON"}
            <input type="file" accept="application/json" onChange={importProgress} className="hidden" />
          </label>
        </div>
        {importStatus && <p className="mt-3 text-sm">{importStatus}</p>}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl border border-violet-300/20 bg-violet-500/10 p-5 shadow-xl"><h2 className="font-semibold">Achievements</h2><ul className="mt-2 grid gap-2">{achievements.map((a) => <li key={a.id}>{a.unlocked ? "🏅" : "🔒"} {a.name}</li>)}</ul></section>
        <section className="rounded-3xl border border-cyan-300/20 bg-cyan-500/10 p-5 shadow-xl"><h2 className="font-semibold">Share card</h2><div className="mt-3 rounded-2xl bg-slate-950 p-4 text-white"><p className="text-xs uppercase tracking-[0.2em] text-cyan-200">METAR Quest</p><p className="mt-2 text-2xl font-black">{rank.rank}</p><p className="mt-2 text-sm text-slate-300">{shareText}</p></div></section>
      </div>

      <section className="rounded-3xl border border-slate-500/30 bg-[var(--surface)]/90 p-5 shadow-xl"><h2 className="font-semibold">Local Leaderboard</h2><ul className="mt-2 grid gap-1 text-sm">{leaderboard.length ? leaderboard.map((e, i) => <li key={`${e.mode}-${e.at}`}>{i + 1}. {e.mode}: {e.score} ({new Date(e.at).toLocaleDateString()})</li>) : <li>No entries yet.</li>}</ul></section>
    </div>
  );
}
