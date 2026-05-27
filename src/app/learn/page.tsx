import { metarExamples } from "@/lib/metar/examples";
import { metarGlossary } from "@/lib/metar/glossary";

export default function LearnPage() {
  return (
    <main className="mx-auto w-full max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">Learn</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-300">Practice with real METAR samples and all key METAR groups/codes.</p>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">METAR glossary (full basics)</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {metarGlossary.map((entry) => (
            <article key={entry.term} className="rounded-lg border border-zinc-300 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900/60">
              <p className="font-mono text-sm font-semibold">{entry.term}</p>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">{entry.definition}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Real examples</h2>
        <div className="mt-4 grid gap-4">
          {metarExamples.map((example) => (
            <article key={example.id} className="rounded-lg border border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900/60">
              <h3 className="font-semibold">{example.title}</h3>
              <p className="mt-1 font-mono text-sm">{example.rawText}</p>
              <p className="mt-2 text-sm">{example.explanation}</p>
              <p className="mt-2 text-xs text-zinc-500">Category: {example.parsed.flightCategory}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
