import type { ParsedMetar } from "@/types/metar";
import { formatClouds, formatWind } from "@/lib/metar/briefing";

type Props = {
  metar: ParsedMetar;
  language?: "pl" | "en";
};

const categoryClasses: Record<string, string> = {
  VFR: "from-emerald-400 to-cyan-300 text-slate-950",
  MVFR: "from-sky-400 to-amber-300 text-slate-950",
  IFR: "from-rose-500 to-orange-400 text-white",
  LIFR: "from-fuchsia-600 to-rose-600 text-white",
};

export default function CockpitWeatherPanel({ metar, language = "en" }: Props) {
  const pl = language === "pl";
  const windRotation = metar.wind?.direction ?? 0;
  const visibility = Math.min(100, Math.round(((metar.visibility?.statuteMiles ?? 10) / 10) * 100));
  const category = metar.flightCategory ?? "VFR";
  const cloudLayers = metar.clouds.slice(0, 4);

  return (
    <section className="rounded-3xl border border-sky-300/20 bg-slate-950/70 p-5 text-white shadow-2xl shadow-sky-950/30">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className={`flex min-h-44 flex-1 flex-col justify-between rounded-3xl bg-gradient-to-br ${categoryClasses[category]} p-5`}>
          <p className="text-xs font-black uppercase tracking-[0.28em] opacity-75">{pl ? "Kategoria lotu" : "Flight category"}</p>
          <p className="text-6xl font-black tracking-tight">{category}</p>
          <p className="text-sm font-semibold opacity-80">{pl ? "Wyliczone z widzialności i podstawy chmur" : "Derived from visibility and ceiling"}</p>
        </div>

        <div className="grid flex-[1.5] gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-sky-200">{pl ? "Wiatr" : "Wind"}</p>
            <div className="relative mx-auto mt-4 flex h-24 w-24 items-center justify-center rounded-full border border-sky-300/30 bg-sky-400/10">
              <div className="absolute h-20 w-0.5 origin-center bg-sky-200 transition-transform" style={{ transform: `rotate(${windRotation}deg)` }} />
              <span className="relative rounded-full bg-slate-950 px-2 py-1 text-xs font-bold">N</span>
            </div>
            <p className="mt-3 text-center text-sm text-slate-200">{formatWind(metar)}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">{pl ? "Widzialność" : "Visibility"}</p>
            <p className="mt-5 text-4xl font-black">{metar.visibility?.raw ?? "10+"}</p>
            <div className="mt-4 h-3 rounded-full bg-slate-800">
              <div className="h-3 rounded-full bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-300" style={{ width: `${visibility}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-400">{metar.visibility?.statuteMiles ?? 10} SM</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-indigo-200">{pl ? "Chmury" : "Clouds"}</p>
            <div className="mt-4 flex h-28 flex-col-reverse justify-start gap-2 overflow-hidden rounded-xl bg-gradient-to-b from-sky-400/20 to-slate-900 p-2">
              {cloudLayers.length ? cloudLayers.map((cloud, index) => (
                <div key={`${cloud.coverage}-${index}`} className="rounded-full bg-white/70 px-2 py-1 text-center text-xs font-bold text-slate-900" style={{ width: `${Math.max(38, 100 - index * 14)}%` }}>
                  {cloud.coverage}{cloud.baseFtAgl ? ` ${cloud.baseFtAgl}ft` : ""}
                </div>
              )) : <div className="rounded-full bg-emerald-300 px-2 py-1 text-center text-xs font-bold text-slate-950">CAVOK</div>}
            </div>
            <p className="mt-2 line-clamp-2 text-xs text-slate-300">{formatClouds(metar)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
