"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import CockpitWeatherPanel from "@/components/metar/CockpitWeatherPanel";
import PilotBriefingCard from "@/components/metar/PilotBriefingCard";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { metarExamples } from "@/lib/metar/examples";
import { PILOT_PROFILES, PROFILE_IDS, type MissionProfile, type PilotDecision } from "@/lib/decision/profiles";
import type { ParsedMetar } from "@/types/metar";
import {
  buildBriefingLeg,
  buildInstructorBriefing,
  calculateCrosswindAssessment,
  certificationTracks,
  historicalWeatherScenarios,
  parseScenarioMetar,
} from "@/lib/briefing/lab";

type ApiResponse = {
  metar?: ParsedMetar;
  taf?: string | null;
  error?: string;
};

const DECISION_STYLE: Record<PilotDecision, string> = {
  GO: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
  CAUTION: "border-amber-300/30 bg-amber-400/10 text-amber-100",
  "NO-GO": "border-rose-300/30 bg-rose-400/10 text-rose-100",
};

function normalizeStation(value: string) {
  return value.trim().toUpperCase();
}

function isIcao(value: string) {
  return /^[A-Z]{4}$/.test(value);
}

export default function BriefingLabPage() {
  const { language } = useLanguage();
  const pl = language === "pl";
  const [profile, setProfile] = useState<MissionProfile>("student-vfr");
  const [departureStation, setDepartureStation] = useState("EPWA");
  const [destinationStation, setDestinationStation] = useState("EPKK");
  const [alternateStation, setAlternateStation] = useState("EPPO");
  const [runway, setRunway] = useState("29");
  const [departureHour, setDepartureHour] = useState(12);
  const [arrivalHour, setArrivalHour] = useState(14);
  const [departureMetar, setDepartureMetar] = useState<ParsedMetar>(metarExamples[3].parsed);
  const [destinationMetar, setDestinationMetar] = useState<ParsedMetar>(metarExamples[1].parsed);
  const [alternateMetar, setAlternateMetar] = useState<ParsedMetar>(metarExamples[0].parsed);
  const [selectedScenarioId, setSelectedScenarioId] = useState(historicalWeatherScenarios[0].id);
  const [scenarioStep, setScenarioStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const legs = useMemo(
    () => [
      buildBriefingLeg("departure", departureMetar, profile),
      buildBriefingLeg("destination", destinationMetar, profile),
      buildBriefingLeg("alternate", alternateMetar, profile),
    ],
    [alternateMetar, departureMetar, destinationMetar, profile],
  );
  const crosswind = useMemo(() => calculateCrosswindAssessment(departureMetar, runway, profile), [departureMetar, profile, runway]);
  const instructor = useMemo(() => buildInstructorBriefing(legs, crosswind), [crosswind, legs]);
  const scenario = historicalWeatherScenarios.find((item) => item.id === selectedScenarioId) ?? historicalWeatherScenarios[0];
  const scenarioMetar = parseScenarioMetar(scenario.timeline[scenarioStep]?.raw ?? scenario.timeline[0].raw);

  const loadLiveBriefing = async () => {
    const dep = normalizeStation(departureStation);
    const dest = normalizeStation(destinationStation);
    const alt = normalizeStation(alternateStation);
    if (![dep, dest, alt].every(isIcao)) {
      setError(pl ? "Podaj trzy poprawne 4-literowe kody ICAO." : "Enter three valid 4-letter ICAO codes.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [depResponse, destResponse, altResponse] = await Promise.all(
        [dep, dest, alt].map((station) => fetch(`/api/weather/metar?station=${encodeURIComponent(station)}&taf=true`)),
      );
      const [depPayload, destPayload, altPayload] = (await Promise.all([depResponse.json(), destResponse.json(), altResponse.json()])) as ApiResponse[];
      if (!depResponse.ok || !depPayload.metar) throw new Error(depPayload.error ?? `No METAR returned for ${dep}`);
      if (!destResponse.ok || !destPayload.metar) throw new Error(destPayload.error ?? `No METAR returned for ${dest}`);
      if (!altResponse.ok || !altPayload.metar) throw new Error(altPayload.error ?? `No METAR returned for ${alt}`);
      setDepartureMetar(depPayload.metar);
      setDestinationMetar(destPayload.metar);
      setAlternateMetar(altPayload.metar);
      setDepartureStation(dep);
      setDestinationStation(dest);
      setAlternateStation(alt);
    } catch (err) {
      setError(err instanceof Error ? err.message : pl ? "Nie udało się zbudować briefingu live." : "Could not build the live briefing.");
    } finally {
      setLoading(false);
    }
  };

  const loadScenarioStep = (step: number) => {
    const nextStep = Math.max(0, Math.min(step, scenario.timeline.length - 1));
    setScenarioStep(nextStep);
    setDepartureMetar(parseScenarioMetar(scenario.timeline[nextStep].raw));
    setDepartureStation(parseScenarioMetar(scenario.timeline[nextStep].raw).station);
  };

  const changeScenario = (id: string) => {
    const next = historicalWeatherScenarios.find((item) => item.id === id) ?? historicalWeatherScenarios[0];
    setSelectedScenarioId(next.id);
    setScenarioStep(0);
    setDepartureMetar(parseScenarioMetar(next.timeline[0].raw));
    setDepartureStation(parseScenarioMetar(next.timeline[0].raw).station);
  };

  return (
    <div className="w-full space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(2,6,23,0.98),rgba(14,116,144,0.45),rgba(79,70,229,0.32))] p-6 text-white shadow-2xl shadow-cyan-950/30">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.26em] text-cyan-200">{pl ? "Nowy moduł premium" : "New premium module"}</p>
            <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">{pl ? "Briefing Lab: wszystko w jednym symulatorze decyzji." : "Briefing Lab: every decision tool in one simulator."}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
              {pl
                ? "Zbuduj pełny briefing trasy, policz crosswind, odtwórz historyczną pogodę, przejdź checkride i dostawaj feedback jak od instruktora."
                : "Build a route briefing, calculate crosswind, replay historical weather, work toward checkrides and receive instructor-style feedback."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/missions" className="rounded-xl border border-cyan-300/40 px-4 py-2 text-sm font-bold text-cyan-100 hover:bg-cyan-400/10">{pl ? "Misje GO/NO-GO" : "GO/NO-GO missions"}</Link>
              <Link href="/exam" className="rounded-xl border border-indigo-300/40 px-4 py-2 text-sm font-bold text-indigo-100 hover:bg-indigo-400/10">{pl ? "Tryb checkride" : "Checkride mode"}</Link>
            </div>
          </div>
          <div className={`rounded-[2rem] border p-5 ${DECISION_STYLE[instructor.overallDecision]}`}>
            <p className="text-xs font-black uppercase tracking-[0.22em] opacity-75">{pl ? "Decyzja instruktora" : "Instructor call"}</p>
            <p className="mt-3 text-6xl font-black">{instructor.overallDecision}</p>
            <p className="mt-3 text-sm leading-6">{instructor.headline}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-sky-300/20 bg-[var(--surface)]/90 p-5 shadow-xl lg:col-span-2">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">{pl ? "Pełny briefing trasy" : "Full route briefing"}</p>
              <h2 className="mt-1 text-2xl font-bold">{departureStation} → {destinationStation} • ALT {alternateStation}</h2>
            </div>
            <button onClick={loadLiveBriefing} disabled={loading} className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950 hover:bg-cyan-200 disabled:opacity-60">
              {loading ? (pl ? "Ładowanie..." : "Loading...") : (pl ? "Wczytaj live briefing" : "Load live briefing")}
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[{ label: pl ? "Start" : "Departure", value: departureStation, set: setDepartureStation }, { label: pl ? "Cel" : "Destination", value: destinationStation, set: setDestinationStation }, { label: "Alternate", value: alternateStation, set: setAlternateStation }].map((item) => (
              <label key={item.label} className="text-xs font-bold uppercase tracking-wide text-slate-400">{item.label}
                <input value={item.value} onChange={(event) => item.set(event.target.value.toUpperCase())} maxLength={4} className="mt-1 block w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 font-mono text-white" />
              </label>
            ))}
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <label className="text-xs font-bold uppercase tracking-wide text-slate-400">{pl ? "Profil" : "Profile"}
              <select value={profile} onChange={(event) => setProfile(event.target.value as MissionProfile)} className="mt-1 block w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-white">
                {PROFILE_IDS.map((id) => <option key={id} value={id}>{PILOT_PROFILES[id].label}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-400">RWY
              <input value={runway} onChange={(event) => setRunway(event.target.value)} className="mt-1 block w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 font-mono text-white" />
            </label>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-400">DEP Z
              <input type="number" min={0} max={23} value={departureHour} onChange={(event) => setDepartureHour(Number(event.target.value))} className="mt-1 block w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-white" />
            </label>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-400">ARR Z
              <input type="number" min={0} max={23} value={arrivalHour} onChange={(event) => setArrivalHour(Number(event.target.value))} className="mt-1 block w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-white" />
            </label>
          </div>
          {error && <p className="mt-3 rounded-xl border border-rose-300/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>}

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {legs.map((leg) => (
              <article key={leg.role} className={`rounded-2xl border p-4 ${DECISION_STYLE[leg.assessment.expected]}`}>
                <p className="text-xs font-black uppercase tracking-[0.18em] opacity-70">{leg.role}</p>
                <p className="mt-2 text-2xl font-black">{leg.station} • {leg.assessment.expected}</p>
                <p className="mt-2 font-mono text-xs opacity-80">{leg.metar.rawText}</p>
                <p className="mt-3 text-sm">{leg.assessment.primaryRisk}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-3xl border border-emerald-300/20 bg-emerald-500/10 p-5 shadow-xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">{pl ? "Crosswind calculator" : "Crosswind calculator"}</p>
          {crosswind ? (
            <div className="mt-4 space-y-3 text-sm">
              <p className="text-4xl font-black">{crosswind.status}</p>
              <p><strong>RWY:</strong> {crosswind.runwayHeading}°</p>
              <p><strong>{pl ? "Wiatr" : "Wind"}:</strong> {crosswind.windDirection ?? "VRB"}°/{crosswind.windSpeedKt} kt{crosswind.gustKt ? ` G${crosswind.gustKt}` : ""}</p>
              <p><strong>Head/tail:</strong> {crosswind.headwindKt} kt</p>
              <p><strong>Crosswind:</strong> {crosswind.crosswindKt} kt{crosswind.gustCrosswindKt ? ` / gust ${crosswind.gustCrosswindKt} kt` : ""}</p>
              <p><strong>{pl ? "Limit profilu" : "Profile limit"}:</strong> {crosswind.limitKt} kt</p>
              <p className="rounded-xl border border-white/10 bg-black/15 p-3">{crosswind.explanation}</p>
            </div>
          ) : <p className="mt-4 text-sm text-slate-300">{pl ? "Podaj poprawny pas, np. 29 albo RWY 11." : "Enter a valid runway, e.g. 29 or RWY 11."}</p>}
        </aside>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-violet-300/20 bg-violet-500/10 p-5 shadow-xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">{pl ? "AI Instructor style" : "AI Instructor style"}</p>
          <h2 className="mt-2 text-2xl font-bold">{pl ? "Debrief po briefingu" : "Briefing debrief"}</h2>
          <ol className="mt-4 space-y-2 text-sm">
            {instructor.scanOrder.map((item) => <li key={item} className="rounded-xl border border-white/10 bg-black/15 p-3">{item}</li>)}
          </ol>
          <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm">
            <p className="font-bold">{pl ? "Rzeczy, których nie wolno pominąć" : "Do not miss"}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {instructor.missedItems.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4 text-sm">
            <p className="font-bold">{pl ? "Następne akcje" : "Next actions"}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {instructor.nextActions.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>

        <div className="rounded-3xl border border-sky-300/20 bg-[var(--surface)]/90 p-5 shadow-xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">{pl ? "Replay real weather" : "Replay real weather"}</p>
              <h2 className="mt-2 text-2xl font-bold">{scenario.title}</h2>
              <p className="mt-1 text-sm text-slate-400">{scenario.route} • {scenario.region} • {scenario.difficulty}</p>
            </div>
            <select value={selectedScenarioId} onChange={(event) => changeScenario(event.target.value)} className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-white">
              {historicalWeatherScenarios.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">{scenario.briefingGoal}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {scenario.timeline.map((step, index) => (
              <button key={step.time} onClick={() => loadScenarioStep(index)} className={`rounded-xl px-3 py-2 text-sm font-bold ${scenarioStep === index ? "bg-cyan-300 text-slate-950" : "border border-slate-600 text-slate-200 hover:border-cyan-300"}`}>{step.time}</button>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/15 p-4">
            <p className="font-mono text-sm">{scenarioMetar.rawText}</p>
            <p className="mt-3 text-sm"><strong>{pl ? "Oczekiwana decyzja" : "Expected call"}:</strong> {scenario.timeline[scenarioStep].expected}</p>
            <p className="mt-2 text-sm text-slate-300">{scenario.teachingPoint}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <CockpitWeatherPanel metar={departureMetar} language={language} />
        <PilotBriefingCard metar={departureMetar} language={language} />
      </section>

      <section className="rounded-3xl border border-indigo-300/20 bg-indigo-500/10 p-5 shadow-xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">{pl ? "Ścieżka certyfikacji" : "Certification path"}</p>
        <h2 className="mt-2 text-2xl font-bold">{pl ? "Od podstaw METAR do Briefing Captain" : "From METAR basics to Briefing Captain"}</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {certificationTracks.map((track) => (
            <article key={track.id} className="rounded-2xl border border-white/10 bg-black/15 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">{track.level}</p>
              <h3 className="mt-2 text-lg font-bold">{track.title}</h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
                {track.requirements.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <p className="mt-3 rounded-xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-sm">{track.unlocks}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
