"use client";

import Link from "next/link";
import { useLanguage } from "@/components/layout/LanguageProvider";

const WOW_POINTS = [
  { key: "mission", color: "cyan", pl: "Live Mission Mode z decyzją GO / CAUTION / NO-GO", en: "Live Mission Mode with GO / CAUTION / NO-GO calls" },
  { key: "cockpit", color: "emerald", pl: "Kokpitowy briefing: wiatr, chmury, widzialność i ryzyko", en: "Cockpit briefing: wind, clouds, visibility and risk" },
  { key: "coach", color: "violet", pl: "Profil pilota, rangi, słabe obszary i plan treningu", en: "Pilot profile, ranks, weak areas and training plan" },
];

export default function Home() {
  const { t, language } = useLanguage();
  const pl = language === "pl";

  return (
    <div className="w-full">
      <main className="flex w-full flex-col gap-10 py-4">
        <section className="relative overflow-hidden rounded-[2.5rem] border border-sky-300/25 bg-[linear-gradient(135deg,rgba(2,6,23,0.98),rgba(15,23,42,0.94),rgba(14,165,233,0.36),rgba(79,70,229,0.35))] p-8 shadow-2xl shadow-sky-950/40 sm:p-12">
          <div className="absolute right-[-8rem] top-[-8rem] h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="absolute bottom-[-10rem] left-[-10rem] h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-sky-300/30 bg-sky-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">
                {t("appName")} • {pl ? "symulator decyzji pogodowych" : "weather decision simulator"}
              </p>
              <h1 className="max-w-4xl text-4xl font-black leading-tight text-white sm:text-6xl">
                {pl ? "Dekoduj METAR jak pilot, podejmuj decyzje jak instruktor." : "Decode METAR like a pilot, make decisions like an instructor."}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                {pl ? "METAR Quest łączy quiz, live weather, kokpitowy briefing i misje GO/NO-GO, żeby nauka wyglądała jak prawdziwy briefing przed lotem." : "METAR Quest blends quiz training, live weather, cockpit briefing and GO/NO-GO missions so learning feels like a real preflight briefing."}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/onboarding" className="inline-flex items-center justify-center rounded-xl bg-cyan-300 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200">
                  {pl ? "Ułóż plan treningu" : "Build training plan"}
                </Link>
                <Link href="/missions" className="inline-flex items-center justify-center rounded-xl border border-cyan-300/60 bg-cyan-300/10 px-6 py-3 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/20">
                  {pl ? "Daily Live Mission" : "Daily Live Mission"}
                </Link>
                <Link href="/decode" className="inline-flex items-center justify-center rounded-xl border border-slate-500 bg-slate-900/70 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-300 hover:text-sky-200">
                  {t("startDecoding")}
                </Link>
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-5 text-white backdrop-blur">
              <div className="rounded-3xl bg-gradient-to-br from-emerald-300 to-cyan-300 p-5 text-slate-950">
                <p className="text-xs font-black uppercase tracking-[0.25em] opacity-70">{pl ? "Aktualny status" : "Current status"}</p>
                <p className="mt-3 text-6xl font-black">VFR</p>
                <p className="mt-2 text-sm font-bold">{pl ? "GO, ale sprawdź wiatr i QNH" : "GO, but verify wind and QNH"}</p>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><p className="text-slate-400">Wind</p><p className="mt-1 font-mono font-bold">28014KT</p></div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><p className="text-slate-400">VIS</p><p className="mt-1 font-mono font-bold">10SM</p></div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><p className="text-slate-400">Cloud</p><p className="mt-1 font-mono font-bold">FEW015</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {WOW_POINTS.map((point) => (
            <article key={point.key} className="rounded-2xl border border-sky-300/20 bg-[var(--surface)]/85 p-5 shadow-lg transition hover:-translate-y-1 hover:border-cyan-300/50">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{pl ? "Nowość" : "New"}</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">{pl ? point.pl : point.en}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/learn", title: t("learnTitle"), desc: t("learnDesc") },
            { href: "/time-attack", title: t("timeAttack"), desc: pl ? "Arcade training z combo, rangami i rekordami." : "Arcade training with combo, ranks and records." },
            { href: "/real-weather", title: t("realWeather"), desc: pl ? "Live METAR/TAF z briefingiem pilota." : "Live METAR/TAF with pilot briefing." },
            { href: "/progress", title: t("progress"), desc: pl ? "Ranga pilota, odznaki i plan treningu." : "Pilot rank, badges and training plan." },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="rounded-2xl border border-slate-500/40 bg-[var(--surface)]/85 p-6 transition hover:-translate-y-1 hover:border-sky-400/50">
              <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{item.desc}</p>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
