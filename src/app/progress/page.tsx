"use client";

import { useMemo } from "react";
import { loadProgress } from "@/lib/storage/progressStorage";
import { getAchievements, loadLeaderboard } from "@/lib/storage/gameStorage";

export default function ProgressPage() {
  const quizProgress = useMemo(() => loadProgress("local-user", "quiz"), []);
  const timeAttackProgress = useMemo(() => loadProgress("local-user", "time-attack"), []);
  const leaderboard = useMemo(() => loadLeaderboard(), []);
  const quizAccuracy = quizProgress && quizProgress.totalAnswered > 0 ? Math.round((quizProgress.totalCorrect / quizProgress.totalAnswered) * 100) : 0;
  const timeAttackAccuracy = timeAttackProgress && timeAttackProgress.totalAnswered > 0 ? Math.round((timeAttackProgress.totalCorrect / timeAttackProgress.totalAnswered) * 100) : 0;
  const achievements = getAchievements({ quizAccuracy, totalAnswered: (quizProgress?.totalAnswered ?? 0) + (timeAttackProgress?.totalAnswered ?? 0), bestTimeAttack: Math.max(...leaderboard.filter((x)=>x.mode==="time-attack").map((x)=>x.score), 0) });

  return <main className="mx-auto w-full max-w-4xl p-6"><h1 className="text-2xl font-semibold">Pilot Profile & Progress</h1>
  <div className="mt-4 grid gap-4 md:grid-cols-2"><section className="rounded-lg border p-4"><h2 className="font-semibold">Quiz</h2><p>Answered: {quizProgress?.totalAnswered ?? 0}</p><p>Accuracy: {quizAccuracy}%</p></section>
  <section className="rounded-lg border p-4"><h2 className="font-semibold">Time Attack</h2><p>Answered: {timeAttackProgress?.totalAnswered ?? 0}</p><p>Accuracy: {timeAttackAccuracy}%</p></section></div>
  <section className="mt-4 rounded-lg border p-4"><h2 className="font-semibold">Achievements</h2><ul className="mt-2 grid gap-2">{achievements.map((a)=><li key={a.id}>{a.unlocked?"🏅":"🔒"} {a.name}</li>)}</ul></section>
  <section className="mt-4 rounded-lg border p-4"><h2 className="font-semibold">Local Leaderboard</h2><ul className="mt-2 grid gap-1 text-sm">{leaderboard.length?leaderboard.map((e,i)=><li key={i}>{i+1}. {e.mode}: {e.score} ({new Date(e.at).toLocaleDateString()})</li>):<li>No entries yet.</li>}</ul></section>
  </main>;
}
