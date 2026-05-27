const modes = [
  {
    title: "Quick Decode",
    description:
      "Translate a live-style METAR into plain English with guided hints for each coded segment.",
    tag: "Practice",
  },
  {
    title: "Timed Quiz",
    description:
      "Race the clock with multiple-choice weather decoding rounds that build confidence under pressure.",
    tag: "Game",
  },
  {
    title: "Challenge Mode",
    description:
      "Solve harder reports featuring variable wind, low ceilings, and changing visibility conditions.",
    tag: "Advanced",
  },
  {
    title: "Daily Brief",
    description:
      "Complete a rotating daily scenario to keep your aviation weather interpretation sharp.",
    tag: "Routine",
  },
];

const highlights = [
  "Built around real pilot weather decision-making flow",
  "Clear explanations for wind, visibility, cloud layers, and trends",
  "Responsive experience for desktop, tablet, and phone study sessions",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-14 sm:px-10 lg:px-16">
        <section className="rounded-3xl border border-sky-400/20 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/70 p-8 shadow-2xl shadow-sky-900/30 sm:p-12">
          <p className="mb-4 inline-flex rounded-full border border-sky-300/30 bg-sky-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
            METAR Quest
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl">
            Decode aviation weather reports with speed and confidence.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            METAR Quest helps pilots, students, and aviation enthusiasts master
            METAR interpretation through interactive decoding, fast-paced quizzes,
            and scenario-based repetition.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/decode"
              className="inline-flex items-center justify-center rounded-xl bg-sky-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
            >
              Start Decoding
            </a>
            <a
              href="/quiz"
              className="inline-flex items-center justify-center rounded-xl border border-slate-600 bg-slate-900/70 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-300 hover:text-sky-200"
            >
              Take a Quiz
            </a>
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Choose your training mode
            </h2>
            <p className="max-w-2xl text-slate-300">
              Build skills step-by-step or jump into game-style challenges that
              simulate real weather briefing pressure.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {modes.map((mode) => (
              <article
                key={mode.title}
                className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-6 transition hover:border-sky-400/40 hover:bg-slate-900"
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
                  {mode.tag}
                </p>
                <h3 className="text-xl font-semibold text-white">{mode.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {mode.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-7 sm:p-9">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            Why pilots use METAR Quest
          </h2>
          <ul className="mt-5 space-y-3 text-slate-300">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-sky-300" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
