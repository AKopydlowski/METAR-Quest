"use client";

import Link from "next/link";
import { useLanguage } from "@/components/layout/LanguageProvider";

export default function Home() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-14 sm:px-10 lg:px-16">
        <section className="rounded-3xl border border-sky-400/20 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/70 p-8 shadow-2xl shadow-sky-900/30 sm:p-12">
          <p className="mb-4 inline-flex rounded-full border border-sky-300/30 bg-sky-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
            {t("appName")}
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl">{t("heroTitle")}</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">{t("heroDesc")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/decode" className="inline-flex items-center justify-center rounded-xl bg-sky-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
              {t("startDecoding")}
            </Link>
            <Link href="/quiz" className="inline-flex items-center justify-center rounded-xl border border-slate-600 bg-slate-900/70 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-300 hover:text-sky-200">
              {t("takeQuiz")}
            </Link>
          </div>
        </section>
        <section className="rounded-2xl border border-amber-300/30 bg-amber-500/10 p-4 text-sm text-amber-100">Nowość: Daily Challenge, tryb Endless, streak/combo, podpowiedzi, lokalny leaderboard i osiągnięcia w zakładce Progress.</section>
        <section className="grid gap-4 sm:grid-cols-2">
          <Link href="/learn" className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-6 hover:border-sky-400/40">
            <h3 className="text-xl font-semibold text-white">{t("learnTitle")}</h3>
            <p className="mt-2 text-sm text-slate-300">{t("learnDesc")}</p>
          </Link>
          <Link href="/time-attack" className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-6 hover:border-sky-400/40">
            <h3 className="text-xl font-semibold text-white">{t("timeAttack")}</h3>
            <p className="mt-2 text-sm text-slate-300">{language === "pl" ? "Tryb z limitem czasu i punktacją." : "Timed mode with score tracking."}</p>
          </Link>
        </section>
      </main>
    </div>
  );
}
