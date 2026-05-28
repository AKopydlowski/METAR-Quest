"use client";

import { useState } from "react";
import Link from "next/link";
import { parseMetar } from "@/lib/metar/parser";

const SAMPLE_METARS = [
  "KJFK 121651Z 18012KT 10SM FEW050 24/16 A2992",
  "EPPO 281200Z 00000KT CAVOK 20/10 Q1013 NOSIG",
  "KSEA 201853Z 21008KT 5SM BKN020 13/11 A2996 RMK AO2",
];

function tokenDescription(token: string): string {
  if (/^[A-Z]{4}$/.test(token)) return "Station ICAO identifier";
  if (/^\d{6}Z$/.test(token)) return "Observation time: day, hour, minute UTC";
  if (/^(\d{3}|VRB)\d{2,3}(G\d{2,3})?KT$/.test(token)) return "Wind direction, speed, and optional gust";
  if (/^\d{3}V\d{3}$/.test(token)) return "Variable wind direction sector";
  if (token === "CAVOK") return "Ceiling and visibility OK";
  if (/^(\d{4}|\d{1,2}SM|\d{1,2}\/\d{1,2}SM)$/.test(token)) return "Reported visibility";
  if (/^R\d{2}[LCR]?\/.+/.test(token)) return "Runway visual range";
  if (/^(SKC|CLR|FEW|SCT|BKN|OVC|VV|NCD)/.test(token)) return "Cloud layer or vertical visibility";
  if (/^(M?\d{2})\/(M?\d{2})$/.test(token)) return "Temperature/dewpoint group";
  if (/^(A\d{4}|Q\d{4})$/.test(token)) return "Altimeter/QNH group";
  if (["NOSIG", "NSW", "BECMG", "TEMPO"].includes(token)) return "Trend forecast token";
  if (token === "RMK") return "Remarks section begins";
  return "Weather, remark, or currently unclassified token";
}

export default function DecodePage() {
  const [raw, setRaw] = useState("");
  const parsed = raw.trim() ? parseMetar(raw.trim()) : null;
  const tokens = raw.trim().split(/\s+/).filter(Boolean);

  return (
    <main className="mx-auto w-full max-w-5xl p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Decode</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Paste any METAR to decode groups, highlight tokens, and find unknown parts.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_METARS.map((sample) => <button key={sample} onClick={() => setRaw(sample)} className="rounded-full border px-3 py-1 text-xs hover:bg-sky-500/10">{sample.slice(0, 4)}</button>)}
        </div>
      </div>

      <label htmlFor="metar" className="mt-4 block text-sm font-medium">
        Paste a METAR string
      </label>
      <textarea
        id="metar"
        value={raw}
        onChange={(event) => setRaw(event.target.value.toUpperCase())}
        className="mt-2 min-h-28 w-full rounded-md border border-zinc-300 p-3 font-mono dark:border-zinc-700 dark:bg-zinc-900"
        placeholder="KJFK 121651Z 18012KT 10SM FEW050 24/16 A2992"
      />

      {!raw.trim() ? (
        <p className="mt-3 text-zinc-600 dark:text-zinc-300">
          Empty state: add a METAR to start decoding.
        </p>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-3">
            <div className="rounded-2xl border border-zinc-300 p-4 dark:border-zinc-700">
              <h2 className="font-semibold">Token map</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {tokens.map((token, index) => (
                  <span key={`${token}-${index}`} title={tokenDescription(token)} className="rounded-lg border border-sky-300/30 bg-sky-500/10 px-2 py-1 font-mono text-sm text-sky-900 dark:text-sky-100">
                    {token}
                  </span>
                ))}
              </div>
            </div>

            {parsed && (
              <div className="rounded-2xl border border-zinc-300 p-4 text-sm dark:border-zinc-700">
                <h2 className="font-semibold">Decoded groups</h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <p><strong>Station:</strong> {parsed.station}</p>
                  <p><strong>Observed:</strong> {parsed.observedAt ?? "Unknown"}</p>
                  <p><strong>Wind:</strong> {parsed.wind ? `${parsed.wind.direction ?? "VRB"}° ${parsed.wind.speedKt}KT${parsed.wind.gustKt ? ` G${parsed.wind.gustKt}` : ""}${parsed.wind.variable ? ` variable ${parsed.wind.variable[0]}-${parsed.wind.variable[1]}` : ""}` : "Unknown"}</p>
                  <p><strong>Visibility:</strong> {parsed.visibility ? `${parsed.visibility.statuteMiles} SM (${parsed.visibility.raw})` : "Unknown"}</p>
                  <p><strong>Ceiling/Clouds:</strong> {parsed.clouds.length ? parsed.clouds.map((c) => `${c.coverage}${c.baseFtAgl ? ` ${c.baseFtAgl}ft` : ""}${c.cloudType ? ` ${c.cloudType}` : ""}`).join(", ") : "None reported"}</p>
                  <p><strong>Weather:</strong> {parsed.weatherCodes.length ? parsed.weatherCodes.join(", ") : "None"}</p>
                  <p><strong>RVR:</strong> {parsed.runwayVisualRange.length ? parsed.runwayVisualRange.map((rvr) => `${rvr.runway}: ${rvr.rangeFt ?? rvr.rangeMeters}${rvr.rangeFt ? " ft" : " m"}`).join(", ") : "None"}</p>
                  <p><strong>Altimeter:</strong> {parsed.altimeter ? parsed.altimeter.hectopascals ? `${parsed.altimeter.hectopascals} hPa` : `${parsed.altimeter.inchesHg.toFixed(2)} inHg` : "Unknown"}</p>
                  <p><strong>Trend:</strong> {parsed.trend?.length ? parsed.trend.join(", ") : "None"}</p>
                  <p><strong>Flight category:</strong> {parsed.flightCategory}</p>
                </div>
              </div>
            )}
          </section>

          <aside className="rounded-2xl border border-indigo-300/30 bg-indigo-500/10 p-4">
            <h2 className="font-semibold text-indigo-950 dark:text-indigo-100">Step-by-step hints</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-700 dark:text-zinc-200">
              <li>Find station and observation time.</li>
              <li>Decode wind before visibility.</li>
              <li>Check BKN/OVC/VV for ceiling.</li>
              <li>Use visibility and ceiling for VFR/MVFR/IFR/LIFR.</li>
            </ol>
            <Link href="/quiz" className="mt-4 inline-flex rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400">Generate more quiz practice</Link>
          </aside>
        </div>
      )}
    </main>
  );
}
