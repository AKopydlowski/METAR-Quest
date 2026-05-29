"use client";

import { useMemo } from "react";
import { loadDailyChallenge, loadLeaderboard } from "@/lib/storage/gameStorage";
import { useLanguage } from "@/components/layout/LanguageProvider";

export default function LeaderboardPage() {
  const { language } = useLanguage();
  const pl = language === "pl";
  const entries = loadLeaderboard();
  const daily = loadDailyChallenge();
  const modeLabels: Record<string, string> = { quiz: "Quiz", "time-attack": "Trening na czas", mission: "Misje", exam: "Egzamin" };
  const byMode = useMemo(() => ["quiz", "time-attack", "mission", "exam"].map((mode) => ({ mode, entries: entries.filter((entry) => entry.mode === mode).slice(0, 10) })), [entries]);

  return (
    <div className="w-full space-y-6">
      <section className="rounded-[2rem] border border-cyan-300/20 bg-slate-950/80 p-6 text-white shadow-2xl shadow-sky-950/30">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">{pl ? "Rywalizacja" : "Competition"}</p>
        <h1 className="mt-2 text-4xl font-black">{pl ? "Ranking i wyzwanie dnia" : "Leaderboard & Daily Challenge"}</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-300">{pl ? "Lokalny ranking porządkuje wyniki i jest przygotowany pod przyszłą synchronizację globalną." : "The local leaderboard is structured for future cloud/global sync."}</p>
        {daily && <p className="mt-4 rounded-xl border border-cyan-300/30 bg-cyan-400/10 p-3 text-sm">Wyzwanie dnia {daily.date}: {daily.score}/{daily.total}</p>}
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        {byMode.map((group) => (
          <section key={group.mode} className="rounded-3xl border border-slate-500/30 bg-[var(--surface)]/90 p-5 shadow-xl">
            <h2 className="text-xl font-bold">{modeLabels[group.mode]}</h2>
            <ol className="mt-3 space-y-2 text-sm">
              {group.entries.length ? group.entries.map((entry, index) => <li key={`${entry.mode}-${entry.at}`} className="flex justify-between rounded-xl border border-white/10 bg-black/10 p-3"><span>#{index + 1} • {new Date(entry.at).toLocaleString("pl-PL")}</span><strong>{entry.score}</strong></li>) : <li className="text-slate-400">{pl ? "Brak wyników." : "No scores yet."}</li>}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
