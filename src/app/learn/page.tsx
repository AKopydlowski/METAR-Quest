import { metarExamples } from "@/lib/metar/examples";
import { metarGlossary } from "@/lib/metar/glossary";

export default function LearnPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-cyan-50 to-white px-6 py-8 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto w-full max-w-5xl">
      <h1 className="text-3xl font-bold text-sky-900 dark:text-sky-100">Learn</h1>
      <p className="mt-2 text-sky-800/90 dark:text-sky-200">Practice with real METAR samples and all key METAR groups/codes.</p>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">METAR glossary (full basics)</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {metarGlossary.map((entry) => (
            <article key={entry.term} className="rounded-xl border border-sky-200 bg-white/90 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/80">
              <p className="font-mono text-sm font-semibold text-sky-900 dark:text-sky-100">{entry.term}</p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{entry.definition}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8">
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
    </main>
  );
}
