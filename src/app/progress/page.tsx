"use client";

import { useMemo } from "react";
import { loadProgress } from "@/lib/storage/progressStorage";
import { getAchievements, loadLeaderboard } from "@/lib/storage/gameStorage";
import { useLanguage } from "@/components/layout/LanguageProvider";
import type { SkillProgress } from "@/types/progress";

function skillAccuracy(skill: SkillProgress) {
  const total = skill.correct + skill.incorrect;
  return total > 0 ? Math.round((skill.correct / total) * 100) : 0;
}

export default function ProgressPage() {
  const { t } = useLanguage();
  const quizProgress = useMemo(() => loadProgress("local-user", "quiz"), []);
  const timeAttackProgress = useMemo(() => loadProgress("local-user", "time-attack"), []);
  const leaderboard = useMemo(() => loadLeaderboard(), []);
  const quizAccuracy = quizProgress && quizProgress.totalAnswered > 0 ? Math.round((quizProgress.totalCorrect / quizProgress.totalAnswered) * 100) : 0;
  const timeAttackAccuracy = timeAttackProgress && timeAttackProgress.totalAnswered > 0 ? Math.round((timeAttackProgress.totalCorrect / timeAttackProgress.totalAnswered) * 100) : 0;
  const achievements = getAchievements({ quizAccuracy, totalAnswered: (quizProgress?.totalAnswered ?? 0) + (timeAttackProgress?.totalAnswered ?? 0), bestTimeAttack: Math.max(...leaderboard.filter((x) => x.mode === "time-attack").map((x) => x.score), 0) });
  const allSkills = [...(quizProgress?.skills ?? []), ...(timeAttackProgress?.skills ?? [])].reduce<Record<string, SkillProgress>>((acc, skill) => {
    const existing = acc[skill.skillTag] ?? { skillTag: skill.skillTag, correct: 0, incorrect: 0, streak: 0 };
    acc[skill.skillTag] = {
      skillTag: skill.skillTag,
      correct: existing.correct + skill.correct,
      incorrect: existing.incorrect + skill.incorrect,
      streak: Math.max(existing.streak, skill.streak),
    };
    return acc;
  }, {});
  const skills = Object.values(allSkills).sort((a, b) => skillAccuracy(a) - skillAccuracy(b));
  const weakest = skills[0];

  return (
    <main className="mx-auto w-full max-w-5xl p-6">
      <h1 className="text-2xl font-semibold">Pilot Profile & Progress</h1>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border p-4"><h2 className="font-semibold">Quiz</h2><p>Answered: {quizProgress?.totalAnswered ?? 0}</p><p>{t("accuracy")}: {quizAccuracy}%</p></section>
        <section className="rounded-lg border p-4"><h2 className="font-semibold">Time Attack</h2><p>Answered: {timeAttackProgress?.totalAnswered ?? 0}</p><p>{t("accuracy")}: {timeAttackAccuracy}%</p></section>
      </div>

      <section className="mt-4 rounded-lg border p-4">
        <h2 className="font-semibold">{t("weakAreas")}</h2>
        {skills.length ? (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {skills.map((skill) => {
              const accuracy = skillAccuracy(skill);
              return (
                <article key={skill.skillTag} className="rounded-xl border p-3">
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
        ) : <p className="mt-2 text-sm">No skill data yet.</p>}
        {weakest && <p className="mt-4 rounded-xl bg-amber-400/10 p-3 text-sm"><strong>{t("recommendedPractice")}:</strong> focus on {weakest.skillTag} questions first.</p>}
      </section>

      <section className="mt-4 rounded-lg border p-4"><h2 className="font-semibold">Achievements</h2><ul className="mt-2 grid gap-2">{achievements.map((a) => <li key={a.id}>{a.unlocked ? "🏅" : "🔒"} {a.name}</li>)}</ul></section>
      <section className="mt-4 rounded-lg border p-4"><h2 className="font-semibold">Local Leaderboard</h2><ul className="mt-2 grid gap-1 text-sm">{leaderboard.length ? leaderboard.map((e, i) => <li key={`${e.mode}-${e.at}`}>{i + 1}. {e.mode}: {e.score} ({new Date(e.at).toLocaleDateString()})</li>) : <li>No entries yet.</li>}</ul></section>
    </main>
  );
}
