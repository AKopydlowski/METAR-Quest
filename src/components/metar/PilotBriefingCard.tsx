import type { ParsedMetar } from "@/types/metar";
import { buildPilotBriefing } from "@/lib/metar/briefing";

type Props = {
  metar: ParsedMetar;
  language?: "pl" | "en";
  compact?: boolean;
};

const toneClasses = {
  calm: "border-emerald-300/40 bg-emerald-400/10 text-emerald-100",
  watch: "border-amber-300/40 bg-amber-400/10 text-amber-100",
  danger: "border-rose-300/40 bg-rose-400/10 text-rose-100",
};

export default function PilotBriefingCard({ metar, language = "en", compact = false }: Props) {
  const briefing = buildPilotBriefing(metar);
  const pl = language === "pl";

  return (
    <section className={`rounded-3xl border p-5 shadow-2xl shadow-slate-950/20 ${toneClasses[briefing.tone]}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] opacity-80">{pl ? "Briefing pilota" : "Pilot briefing"}</p>
          <h2 className="mt-2 text-2xl font-bold text-white">{briefing.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-100/90">{briefing.summary}</p>
        </div>
        <div className="rounded-2xl border border-white/20 bg-black/25 px-5 py-3 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-300">{pl ? "Decyzja" : "Decision"}</p>
          <p className="text-3xl font-black text-white">{briefing.goDecision}</p>
        </div>
      </div>

      {!compact && (
        <div className="mt-5 grid gap-3 md:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-2xl border border-white/15 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{pl ? "Token kluczowy" : "Key token"}</p>
            <p className="mt-2 font-mono text-2xl font-bold text-white">{briefing.keyToken}</p>
            <p className="mt-3 text-sm text-slate-200"><strong>{pl ? "Ryzyko:" : "Risk:"}</strong> {briefing.primaryRisk}</p>
            <p className="mt-1 text-sm text-slate-200"><strong>{pl ? "Trening:" : "Training:"}</strong> {briefing.trainingFocus}</p>
          </div>
          <ul className="grid gap-2 text-sm text-slate-100">
            {briefing.alerts.map((alert) => (
              <li key={alert} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">✈️ {alert}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
