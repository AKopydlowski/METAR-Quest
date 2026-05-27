"use client";

import Link from "next/link";
import { useLanguage } from "@/components/layout/LanguageProvider";

export default function Home() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-16">
        <section className="rounded-3xl border border-sky-300/25 bg-[linear-gradient(150deg,rgba(15,23,42,0.95),rgba(30,41,59,0.9),rgba(30,64,175,0.55))] p-8 shadow-2xl shadow-sky-950/40 sm:p-12">
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
        <section className="grid gap-4 rounded-2xl border border-indigo-300/20 bg-[var(--surface)]/80 p-5 sm:grid-cols-3">
          <div className="rounded-xl border border-sky-300/20 bg-sky-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-sky-200">{language === "pl" ? "Nowość" : "New"}</p>
            <p className="mt-1 text-sm text-slate-200">{language === "pl" ? "Lepszy Time Attack z combo, mnożnikiem i podsumowaniem rundy." : "Enhanced Time Attack with combo, multipliers and round summary."}</p>
          </div>
          <div className="rounded-xl border border-indigo-300/20 bg-indigo-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-indigo-200">{language === "pl" ? "Tryby" : "Modes"}</p>
            <p className="mt-1 text-sm text-slate-200">{language === "pl" ? "Nauka, dekodowanie, quiz i trening na prawdziwych METARach." : "Learn, decode, quiz, and practice on real METAR reports."}</p>
          </div>
          <div className="rounded-xl border border-emerald-300/20 bg-emerald-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-emerald-200">{language === "pl" ? "Cel" : "Goal"}</p>
            <p className="mt-1 text-sm text-slate-200">{language === "pl" ? "Codziennie minimum 10 minut i zauważalny wzrost szybkości odczytu." : "Train at least 10 minutes daily and boost reading speed quickly."}</p>
          </div>
        </section>
        <section className="grid gap-4 sm:grid-cols-2">
          <Link href="/learn" className="rounded-2xl border border-slate-500/40 bg-[var(--surface)]/85 p-6 hover:border-sky-400/50">
            <h3 className="text-xl font-semibold text-white">{t("learnTitle")}</h3>
            <p className="mt-2 text-sm text-slate-300">{t("learnDesc")}</p>
          </Link>
          <Link href="/time-attack" className="rounded-2xl border border-slate-500/40 bg-[var(--surface)]/85 p-6 hover:border-sky-400/50">
            <h3 className="text-xl font-semibold text-white">{t("timeAttack")}</h3>
            <p className="mt-2 text-sm text-slate-300">{language === "pl" ? "Szybka runda z limitem czasu, combo i mnożnikiem punktów." : "Fast round with timer, combo streak and score multiplier."}</p>
          </Link>
        </section>
      </main>
    </div>
  );
}
