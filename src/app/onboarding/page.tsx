"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { PILOT_PROFILES, PROFILE_IDS, type MissionProfile } from "@/lib/decision/profiles";

const GOALS = [
  { id: "exam", en: "Pass an exam", pl: "Zdać egzamin", skill: "altimeter" },
  { id: "speed", en: "Read METAR faster", pl: "Szybciej czytać METAR", skill: "wind" },
  { id: "decision", en: "Make safer GO/NO-GO calls", pl: "Podejmować bezpieczniejsze decyzje GO/NO-GO", skill: "clouds" },
  { id: "live", en: "Train with live weather", pl: "Ćwiczyć na pogodzie na żywo", skill: "visibility" },
];

export default function OnboardingPage() {
  const { language } = useLanguage();
  const pl = language === "pl";
  const [profile, setProfile] = useState<MissionProfile>("student-vfr");
  const [goal, setGoal] = useState(GOALS[0].id);
  const [confidence, setConfidence] = useState(2);

  const result = useMemo(() => {
    const goalDef = GOALS.find((item) => item.id === goal) ?? GOALS[0];
    const level = confidence >= 4 ? "zaawansowany" : confidence >= 3 ? "praktyka" : "podstawy";
    const next = confidence >= 4 ? "/missions" : `/quiz?skill=${goalDef.skill}`;
    return { goalDef, level, next };
  }, [confidence, goal]);

  return (
    <div className="w-full space-y-6">
      <section className="rounded-[2rem] border border-cyan-300/20 bg-slate-950/80 p-6 text-white shadow-2xl shadow-sky-950/30">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">3-minutowa diagnoza</p>
        <h1 className="mt-2 text-4xl font-black">{pl ? "Zbuduj swój plan treningu METAR" : "Build your METAR training plan"}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          {pl ? "Wybierz profil, cel i poziom pewności. METAR Quest skieruje Cię do najlepszego pierwszego ćwiczenia." : "Choose your profile, goal and confidence. METAR Quest routes you to the best first drill."}
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-sky-300/20 bg-[var(--surface)]/90 p-5 shadow-xl">
          <h2 className="font-bold">{pl ? "1. Kim jesteś?" : "1. Who are you?"}</h2>
          <div className="mt-4 grid gap-2">
            {PROFILE_IDS.map((id) => (
              <button key={id} onClick={() => setProfile(id)} className={`rounded-xl border p-3 text-left text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] ${profile === id ? "border-cyan-300 bg-cyan-400/10" : "border-slate-500/30"}`}>
                <strong>{PILOT_PROFILES[id].label}</strong><br />{PILOT_PROFILES[id][language]}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-sky-300/20 bg-[var(--surface)]/90 p-5 shadow-xl">
          <h2 className="font-bold">{pl ? "2. Jaki jest cel?" : "2. What is the goal?"}</h2>
          <div className="mt-4 grid gap-2">
            {GOALS.map((item) => (
              <button key={item.id} onClick={() => setGoal(item.id)} className={`rounded-xl border p-3 text-left text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] ${goal === item.id ? "border-emerald-300 bg-emerald-400/10" : "border-slate-500/30"}`}>
                {pl ? item.pl : item.en}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-sky-300/20 bg-[var(--surface)]/90 p-5 shadow-xl">
          <h2 className="font-bold">{pl ? "3. Jak pewnie czytasz METAR?" : "3. How confident are you?"}</h2>
          <input type="range" min="1" max="5" value={confidence} onChange={(event) => setConfidence(Number(event.target.value))} className="mt-6 w-full" />
          <p className="mt-3 text-5xl font-black text-cyan-300">{confidence}/5</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{pl ? "Im niżej, tym więcej prowadzonego treningu przed misją." : "Lower scores get more guided drills before missions."}</p>
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-300/20 bg-emerald-500/10 p-6 shadow-xl">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">{pl ? "Rekomendacja" : "Recommendation"}</p>
        <h2 className="mt-2 text-3xl font-black">{PILOT_PROFILES[profile].label} • {result.level}</h2>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">
          {pl ? "Pierwszy nacisk treningu:" : "First training focus:"} <strong>{pl ? result.goalDef.pl : result.goalDef.en}</strong>
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={result.next} className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950">{pl ? "Zacznij rekomendowany trening" : "Start recommended training"}</Link>
          <Link href="/missions" className="rounded-xl border border-emerald-300/40 px-5 py-3 text-sm font-bold text-emerald-200">{pl ? "Przejdź od razu do misji" : "Jump to mission"}</Link>
        </div>
      </section>
    </div>
  );
}
