import { assessTafMissionWindow, parseTafTimeline } from "@/lib/metar/taf";
import type { Language } from "@/components/layout/LanguageProvider";

const riskLabel = { low: "niskie", medium: "umiarkowane", high: "wysokie" };

const riskClass = {
  low: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
  medium: "border-amber-300/40 bg-amber-400/10 text-amber-100",
  high: "border-rose-300/40 bg-rose-500/10 text-rose-100",
};

export default function TafTimeline({ taf, language, departureHour, arrivalHour }: { taf?: string | null; language: Language; departureHour?: number; arrivalHour?: number }) {
  const pl = language === "pl";
  const segments = parseTafTimeline(taf);
  const assessment = departureHour !== undefined && arrivalHour !== undefined ? assessTafMissionWindow(taf, departureHour, arrivalHour) : null;

  if (!segments.length) {
    return <p className="mt-2 text-sm text-slate-400">{pl ? "Brak osi TAF dla tej stacji." : "No TAF timeline for this station."}</p>;
  }

  return (
    <div className="space-y-4">
      {assessment && (
        <div className={`rounded-2xl border p-4 ${riskClass[assessment.highestRisk]}`}>
          <p className="text-xs font-black uppercase tracking-[0.2em]">{pl ? "Okno misji" : "Mission window"}</p>
          <p className="mt-2 text-2xl font-black">{assessment.recommendation}</p>
          <p className="mt-1 text-sm">{assessment.rationale}</p>
        </div>
      )}
      <div className="grid gap-3 lg:grid-cols-2">
        {segments.map((segment) => (
          <article key={segment.id} className={`rounded-2xl border p-4 ${riskClass[segment.risk]}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold">{segment.label}</h3>
              <span className="rounded-full border border-current/30 px-2 py-1 text-xs font-black uppercase">{pl ? riskLabel[segment.risk] : segment.risk}</span>
            </div>
            <p className="mt-1 text-xs uppercase tracking-wide opacity-80">{segment.window}</p>
            <p className="mt-3 text-sm">{segment.summary}</p>
            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-bold uppercase tracking-wide opacity-80">{pl ? "Surowy segment TAF" : "Raw TAF segment"}</summary>
              <p className="mt-2 whitespace-pre-wrap rounded-xl bg-black/20 p-3 font-mono text-xs">{segment.raw}</p>
            </details>
          </article>
        ))}
      </div>
    </div>
  );
}
