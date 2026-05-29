import Link from "next/link";
import { metarExamples } from "@/lib/metar/examples";
import { metarGlossary } from "@/lib/metar/glossary";
import { learnModules } from "@/content/learnModules";

export default function LearnPage() {
  return (
    <div className="w-full space-y-8">
      <section className="rounded-[2rem] border border-sky-300/20 bg-slate-950/80 p-6 text-white shadow-2xl shadow-sky-950/30">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">Training syllabus</p>
        <h1 className="mt-2 text-4xl font-black">Learn METAR by mission skill</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Each module is designed as a short loop: read the rule, decode one sample, answer focused quiz questions, then apply it in a live mission.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {learnModules.map((module, index) => (
          <article key={module.id} className="rounded-3xl border border-sky-300/20 bg-[var(--surface)]/90 p-5 shadow-xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Module {index + 1} • {module.level}</p>
            <h2 className="mt-2 text-xl font-bold">{module.title}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{module.goal}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/quiz?skill=${module.skill}`} className="rounded-xl bg-cyan-400 px-3 py-2 text-xs font-black text-slate-950">Drill</Link>
              <Link href="/missions" className="rounded-xl border border-cyan-300/40 px-3 py-2 text-xs font-bold text-cyan-200">Mission</Link>
            </div>
          </article>
        ))}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">METAR glossary</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {metarGlossary.map((entry) => (
            <article key={entry.term} className="rounded-xl border border-sky-200 bg-white/90 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/80">
              <p className="font-mono text-sm font-semibold text-sky-900 dark:text-sky-100">{entry.term}</p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{entry.definition}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-violet-900 dark:text-violet-100">Real examples</h2>
        <div className="mt-4 grid gap-4">
          {metarExamples.map((example) => (
            <article key={example.id} className="rounded-xl border border-violet-200 bg-white/95 p-4 shadow-sm dark:border-violet-400/30 dark:bg-slate-900/80">
              <h3 className="font-semibold text-violet-900 dark:text-violet-100">{example.title}</h3>
              <p className="mt-1 font-mono text-sm text-slate-800 dark:text-slate-100">{example.rawText}</p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{example.explanation}</p>
              <p className="mt-2 text-xs font-medium text-violet-700 dark:text-violet-200">Category: {example.parsed.flightCategory}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
