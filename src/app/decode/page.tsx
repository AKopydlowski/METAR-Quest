"use client";

import { useState } from "react";

export default function DecodePage() {
  const [raw, setRaw] = useState("");

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Decode</h1>
      <label htmlFor="metar" className="mt-4 block text-sm font-medium">
        Paste a METAR string
      </label>
      <textarea
        id="metar"
        value={raw}
        onChange={(event) => setRaw(event.target.value)}
        className="mt-2 w-full rounded-md border border-zinc-300 p-3 dark:border-zinc-700 dark:bg-zinc-900"
        placeholder="KJFK 121651Z 18012KT 10SM FEW050 24/16 A2992"
      />

      {!raw.trim() ? (
        <p className="mt-3 text-zinc-600 dark:text-zinc-300">
          Empty state: add a METAR to start decoding.
        </p>
      ) : (
        <pre className="mt-3 rounded-md bg-zinc-100 p-3 text-sm dark:bg-zinc-800">
          {raw.trim()}
        </pre>
      )}
    </main>
  );
}
