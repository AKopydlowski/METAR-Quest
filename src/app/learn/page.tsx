import { metarExamples } from "@/lib/metar/examples";

export default function LearnPage() {
  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Learn</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-300">Practice with real METAR samples and explanations.</p>
      <div className="mt-5 grid gap-4">
        {metarExamples.map((example) => (
          <article key={example.id} className="rounded-lg border p-4">
            <h2 className="font-semibold">{example.title}</h2>
            <p className="mt-1 font-mono text-sm">{example.rawText}</p>
            <p className="mt-2 text-sm">{example.explanation}</p>
            <p className="mt-2 text-xs text-zinc-500">Category: {example.parsed.flightCategory}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
