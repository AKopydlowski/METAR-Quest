import { Suspense } from "react";

async function WeatherSummary() {
  return <p className="text-zinc-600 dark:text-zinc-300">No weather loaded yet.</p>;
}

export default function RealWeatherPage() {
  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Real Weather</h1>
      <Suspense fallback={<p className="mt-3">Loading weather…</p>}>
        <div className="mt-3">
          <WeatherSummary />
        </div>
      </Suspense>
    </main>
  );
}
