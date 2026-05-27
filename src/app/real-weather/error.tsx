"use client";

export default function RealWeatherError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Real Weather</h1>
      <p className="mt-3 text-red-600">Could not load weather: {error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-md border px-3 py-2"
      >
        Try again
      </button>
    </main>
  );
}
