"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import CockpitWeatherPanel from "@/components/metar/CockpitWeatherPanel";
import PilotBriefingCard from "@/components/metar/PilotBriefingCard";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { buildPilotBriefing } from "@/lib/metar/briefing";
import { metarExamples } from "@/lib/metar/examples";
import { assessWeatherDecision } from "@/lib/decision/decisionEngine";
import { PILOT_PROFILES, PROFILE_IDS, type MissionProfile, type PilotDecision } from "@/lib/decision/profiles";
import type { ParsedMetar } from "@/types/metar";

type ApiResponse = {
  metar?: ParsedMetar;
  error?: string;
};

const SCENARIO_STATIONS = ["EPWA", "EPKK", "KJFK", "EGLL", "KLAX", "EDDF"];

function dailyIndex(length: number) {
  const seed = Number(new Date().toISOString().slice(0, 10).replace(/-/g, ""));
  return seed % Math.max(length, 1);
}

export default function MissionsPage() {
  const { language } = useLanguage();
  const pl = language === "pl";
  const [profile, setProfile] = useState<MissionProfile>("student-vfr");
  const [station, setStation] = useState("EPWA");
  const [metar, setMetar] = useState<ParsedMetar>(metarExamples[1].parsed);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decision, setDecision] = useState<PilotDecision | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  const assessment = useMemo(() => (decision ? assessWeatherDecision(profile, metar, decision) : null), [decision, metar, profile]);
  const profileCopy = PILOT_PROFILES[profile][language];
  const briefing = useMemo(() => buildPilotBriefing(metar), [metar]);

  const generateScenario = () => {
    const next = metarExamples[Math.floor(Math.random() * metarExamples.length)];
    const nextProfile = PROFILE_IDS[Math.floor(Math.random() * PROFILE_IDS.length)];
    const nextStation = SCENARIO_STATIONS[Math.floor(Math.random() * SCENARIO_STATIONS.length)];
    setMetar(next.parsed);
    setProfile(nextProfile);
    setStation(nextStation);
    setDecision(null);
    setError(null);
    setShareStatus(null);
  };

  const loadDailyMission = () => {
    const next = metarExamples[dailyIndex(metarExamples.length)];
    const nextProfile = PROFILE_IDS[dailyIndex(PROFILE_IDS.length)];
    setMetar(next.parsed);
    setProfile(nextProfile);
    setStation(next.parsed.station);
    setDecision(null);
    setError(null);
    setShareStatus(null);
  };

  const loadLiveMission = async () => {
    const normalized = station.trim().toUpperCase();
    if (!/^[A-Z]{4}$/.test(normalized)) {
      setError(pl ? "Podaj poprawny 4-literowy kod ICAO." : "Enter a valid 4-letter ICAO code.");
      return;
    }

    setLoading(true);
    setError(null);
    setDecision(null);
    setShareStatus(null);
    try {
      const response = await fetch(`/api/weather/metar?station=${encodeURIComponent(normalized)}`);
      const payload = (await response.json()) as ApiResponse;
      if (!response.ok || payload.error || !payload.metar) throw new Error(payload.error ?? "No METAR returned");
      setMetar(payload.metar);
      setStation(normalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : pl ? "Nie udało się pobrać misji." : "Could not load mission.");
    } finally {
      setLoading(false);
    }
  };

  const shareMission = async () => {
    if (!assessment) return;
    const text = `METAR Quest mission ${metar.station}: my call ${decision}, instructor ${assessment.expected}, score ${assessment.score}/100. Key token: ${assessment.keyToken}.`;
    try {
      if (navigator.share) await navigator.share({ title: "METAR Quest mission", text });
      else await navigator.clipboard.writeText(text);
      setShareStatus(pl ? "Gotowe do udostępnienia." : "Ready to share.");
    } catch {
      setShareStatus(pl ? "Udostępnianie przerwane." : "Sharing cancelled.");
    }
  };

  return (
    <div className="w-full space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-sky-300/20 bg-slate-950/80 p-6 text-white shadow-2xl shadow-sky-950/30">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">
              {pl ? "Live Mission Mode" : "Live Mission Mode"}
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              {pl ? "Podejmij decyzję jak pilot, nie jak uczestnik quizu." : "Make the call like a pilot, not a quiz taker."}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              {pl ? "Wybierz profil misji, wczytaj aktualny METAR i zdecyduj GO / CAUTION / NO-GO. Silnik decyzji pokaże, który token i minima profilu zmieniły ryzyko." : "Choose a mission profile, load live METAR and decide GO / CAUTION / NO-GO. The decision engine shows which token and profile minima changed the risk."}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">{pl ? "Profil misji" : "Mission profile"}</label>
            <select value={profile} onChange={(event) => { setProfile(event.target.value as MissionProfile); setDecision(null); }} className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-3 text-white">
              {PROFILE_IDS.map((id) => <option key={id} value={id}>{PILOT_PROFILES[id].label}</option>)}
            </select>
            <p className="mt-3 text-sm text-slate-300">{profileCopy}</p>
            <div className="mt-4 flex gap-2">
              <input value={station} maxLength={4} onChange={(event) => setStation(event.target.value.toUpperCase().replace(/[^A-Z]/g, ""))} className="min-w-0 flex-1 rounded-xl border border-slate-600 bg-slate-950 px-3 py-3 font-mono text-white" placeholder="EPWA" />
              <button onClick={loadLiveMission} disabled={loading} className="rounded-xl bg-cyan-300 px-4 py-3 font-bold text-slate-950 disabled:opacity-60">{loading ? "..." : pl ? "Wczytaj" : "Load"}</button>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button onClick={loadDailyMission} type="button" className="rounded-xl border border-cyan-300/40 px-4 py-2 text-sm font-bold text-cyan-100 hover:bg-cyan-500/10">{pl ? "Daily Mission" : "Daily Mission"}</button>
              <button onClick={generateScenario} type="button" className="rounded-xl border border-emerald-300/40 px-4 py-2 text-sm font-bold text-emerald-100 hover:bg-emerald-500/10">{pl ? "Scenariusz" : "Scenario"}</button>
            </div>
            {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
          </div>
        </div>
      </section>

      <CockpitWeatherPanel metar={metar} language={language} />
      <PilotBriefingCard metar={metar} language={language} />

      <section className="rounded-3xl border border-indigo-300/20 bg-[var(--surface)]/90 p-6 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-300">{pl ? "Twoja decyzja" : "Your call"}</p>
            <h2 className="mt-2 text-2xl font-bold">{pl ? "Czy lecisz?" : "Do you launch?"}</h2>
            <p className="mt-2 font-mono text-sm text-slate-300">{metar.rawText}</p>
            <p className="mt-2 text-xs text-slate-400">{pl ? "Briefing bazowy" : "Baseline briefing"}: {briefing.goDecision} • {briefing.primaryRisk}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["GO", "CAUTION", "NO-GO"] as const).map((item) => (
              <button key={item} onClick={() => setDecision(item)} className={`rounded-2xl px-5 py-3 font-black transition ${decision === item ? "bg-cyan-300 text-slate-950" : "border border-slate-600 bg-slate-900/60 text-white hover:border-cyan-300"}`}>{item}</button>
            ))}
          </div>
        </div>

        {assessment && (
          <div className={`mt-5 rounded-2xl border p-4 ${assessment.match ? "border-emerald-300/40 bg-emerald-400/10" : "border-amber-300/40 bg-amber-400/10"}`}>
            <p className="text-lg font-bold">{assessment.match ? (pl ? "Świetna decyzja." : "Great call.") : (pl ? "Sprawdź briefing jeszcze raz." : "Review the briefing again.")} <span className="text-sm font-semibold">{assessment.score}/100</span></p>
            <p className="mt-2 text-sm text-slate-200">
              {pl ? "Decyzja instruktora:" : "Instructor call:"} <strong>{assessment.expected}</strong>. {pl ? "Token krytyczny:" : "Critical token:"} <strong className="font-mono">{assessment.keyToken}</strong>.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {assessment.risks.map((risk) => <p key={risk.id} className="rounded-xl border border-white/10 bg-black/15 p-3 text-sm"><strong>{risk.token}</strong><br />{risk.message}</p>)}
            </div>
            <div className="mt-4 rounded-xl border border-cyan-300/20 bg-cyan-400/10 p-4 text-sm">
              <p className="font-bold">{pl ? "Co zmieniłoby decyzję?" : "What would improve the call?"}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {assessment.whatWouldImprove.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <p className="mt-2">{pl ? "Trening" : "Training"}: <strong>{assessment.trainingFocus}</strong></p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/quiz?skill=${encodeURIComponent(assessment.trainingFocus === "taf" ? "weather" : assessment.trainingFocus)}`} className="inline-flex rounded-xl bg-indigo-500 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-400">
                {pl ? "Przećwicz podobne pytania" : "Practice similar questions"}
              </Link>
              <button onClick={shareMission} className="rounded-xl border border-cyan-300/40 px-4 py-2 text-sm font-bold hover:bg-cyan-500/10">{pl ? "Udostępnij wynik" : "Share result"}</button>
              <button onClick={generateScenario} className="rounded-xl border border-indigo-300/40 px-4 py-2 text-sm font-bold hover:bg-indigo-500/10">{pl ? "Kolejna misja" : "Next mission"}</button>
            </div>
            {shareStatus && <p className="mt-3 text-sm text-cyan-200">{shareStatus}</p>}
          </div>
        )}
      </section>
    </div>
  );
}
