"use client";

import { useState } from "react";
import { parseMetar } from "@/lib/metar/parser";

export default function DecodePage() {
  const [raw, setRaw] = useState("");
  const parsed = raw.trim() ? parseMetar(raw.trim()) : null;

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
        <div className="mt-4 space-y-3">
          <pre className="rounded-md bg-zinc-100 p-3 text-sm dark:bg-zinc-800">{raw.trim()}</pre>
          {parsed && (
            <div className="rounded-md border border-zinc-300 p-3 text-sm dark:border-zinc-700">
              <p><strong>Station:</strong> {parsed.station}</p>
              <p><strong>Observed:</strong> {parsed.observedAt ?? "Unknown"}</p>
              <p><strong>Wind:</strong> {parsed.wind ? `${parsed.wind.direction ?? "VRB"}° ${parsed.wind.speedKt}KT${parsed.wind.gustKt ? ` G${parsed.wind.gustKt}` : ""}` : "Unknown"}</p>
              <p><strong>Visibility:</strong> {parsed.visibility ? `${parsed.visibility.statuteMiles} SM (${parsed.visibility.raw})` : "Unknown"}</p>
              <p><strong>Ceiling/Clouds:</strong> {parsed.clouds.length ? parsed.clouds.map((c) => `${c.coverage}${c.baseFtAgl ? ` ${c.baseFtAgl}ft` : ""}`).join(", ") : "None reported"}</p>
              <p><strong>Flight category:</strong> {parsed.flightCategory}</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
