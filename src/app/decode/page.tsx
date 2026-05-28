"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import CockpitWeatherPanel from "@/components/metar/CockpitWeatherPanel";
import PilotBriefingCard from "@/components/metar/PilotBriefingCard";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { parseMetar } from "@/lib/metar/parser";

const SAMPLE_METARS = [
  "KJFK 121651Z 18012KT 10SM FEW050 24/16 A2992",
  "EPPO 281200Z 00000KT CAVOK 20/10 Q1013 NOSIG",
  "KSEA 201853Z 21008KT 5SM BKN020 13/11 A2996 RMK AO2",
  "KJFK 121651Z 18012G22KT 150V220 1 1/2SM R04R/1200FT/D TSRA BR BKN008CB 18/16 A2992 TEMPO RMK AO2",
];

type TokenInfo = {
  label: string;
  pl: string;
  en: string;
  severity: "normal" | "watch" | "danger";
};

function tokenDescription(token: string): TokenInfo {
  if (/^[A-Z]{4}$/.test(token)) return { label: "ICAO", pl: "Identyfikator lotniska/stacji.", en: "Airport/station ICAO identifier.", severity: "normal" };
  if (/^\d{6}Z$/.test(token)) return { label: "TIME", pl: "Czas obserwacji: dzień, godzina i minuta UTC.", en: "Observation time: day, hour and minute UTC.", severity: "normal" };
  if (/^(\d{3}|VRB)\d{2,3}(G\d{2,3})?KT$/.test(token)) return { label: "WIND", pl: "Wiatr: kierunek, prędkość i opcjonalne porywy.", en: "Wind: direction, speed and optional gusts.", severity: token.includes("G") ? "watch" : "normal" };
  if (/^\d{3}V\d{3}$/.test(token)) return { label: "VAR", pl: "Zmienny sektor kierunku wiatru.", en: "Variable wind direction sector.", severity: "watch" };
  if (token === "CAVOK") return { label: "CAVOK", pl: "Widzialność i chmury bez istotnych ograniczeń operacyjnych.", en: "Ceiling and visibility OK with no significant operational cloud/weather.", severity: "normal" };
  if (/^(\d{4}|\d{1,2}SM|\d{1,2}\/\d{1,2}SM)$/.test(token)) return { label: "VIS", pl: "Raportowana widzialność.", en: "Reported visibility.", severity: token.startsWith("1") || token.startsWith("2") ? "danger" : "normal" };
  if (/^R\d{2}[LCR]?\/.+/.test(token)) return { label: "RVR", pl: "Widzialność wzdłuż pasa — bardzo ważna przy ograniczonej widzialności.", en: "Runway visual range — critical when visibility is restricted.", severity: "danger" };
  if (/^(BKN|OVC|VV)\d{3}/.test(token)) return { label: "CEILING", pl: "Warstwa tworząca podstawę chmur, może zmienić kategorię lotu.", en: "Ceiling-producing layer that can change flight category.", severity: "watch" };
  if (/^(SKC|CLR|FEW|SCT|NCD)/.test(token)) return { label: "CLOUD", pl: "Warstwa chmur, zwykle bez podstawy operacyjnej przy FEW/SCT.", en: "Cloud layer, usually non-ceiling for FEW/SCT.", severity: "normal" };
  if (/^(M?\d{2})\/(M?\d{2})$/.test(token)) return { label: "TEMP", pl: "Temperatura / punkt rosy w stopniach Celsjusza.", en: "Temperature / dewpoint in Celsius.", severity: "normal" };
  if (/^(A\d{4}|Q\d{4})$/.test(token)) return { label: "QNH", pl: "Nastawa wysokościomierza: A w inHg, Q w hPa.", en: "Altimeter setting: A in inHg, Q in hPa.", severity: "normal" };
  if (["NOSIG", "NSW", "BECMG", "TEMPO"].includes(token)) return { label: "TREND", pl: "Trend prognozy, szczególnie ważny przy TEMPO/BECMG.", en: "Trend forecast token, especially important for TEMPO/BECMG.", severity: token === "NOSIG" ? "normal" : "watch" };
  if (token === "RMK") return { label: "RMK", pl: "Początek sekcji uwag.", en: "Remarks section begins.", severity: "normal" };
  return { label: "WX", pl: "Zjawisko pogody, uwaga albo token jeszcze niesklasyfikowany.", en: "Weather, remark, or currently unclassified token.", severity: "watch" };
}

const severityClasses = {
  normal: "border-sky-300/30 bg-sky-500/10 text-sky-900 dark:text-sky-100",
  watch: "border-amber-300/40 bg-amber-400/15 text-amber-900 dark:text-amber-100",
  danger: "border-rose-300/50 bg-rose-500/15 text-rose-900 dark:text-rose-100",
};

export default function DecodePage() {
  const { language } = useLanguage();
  const pl = language === "pl";
  const [raw, setRaw] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const parsed = raw.trim() ? parseMetar(raw.trim()) : null;
  const tokens = useMemo(() => raw.trim().split(/\s+/).filter(Boolean), [raw]);
  const selectedToken = tokens[selectedIndex] ?? tokens[0];
  const selectedInfo = selectedToken ? tokenDescription(selectedToken) : null;

  return (
    <div className="w-full space-y-5">
      <section className="rounded-[2rem] border border-sky-300/20 bg-slate-950/75 p-6 text-white shadow-2xl shadow-sky-950/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">{pl ? "Dekoder kinowy" : "Cinematic decoder"}</p>
            <h1 className="mt-2 text-4xl font-black">{pl ? "Rozbij METAR token po tokenie" : "Break METAR down token by token"}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">{pl ? "Kliknij dowolny token, zobacz jego znaczenie i natychmiast połącz go z kategorią lotu." : "Click any token, understand its meaning and connect it instantly to the flight category."}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_METARS.map((sample) => <button key={sample} onClick={() => { setRaw(sample); setSelectedIndex(0); }} className="rounded-full border border-cyan-300/30 px-3 py-1 text-xs font-bold text-cyan-100 hover:bg-cyan-500/10">{sample.slice(0, 4)}</button>)}
          </div>
        </div>
      </section>

      <label htmlFor="metar" className="block text-sm font-medium">
        {pl ? "Wklej depeszę METAR" : "Paste a METAR string"}
      </label>
      <textarea
        id="metar"
        value={raw}
        onChange={(event) => { setRaw(event.target.value.toUpperCase()); setSelectedIndex(0); }}
        className="min-h-28 w-full rounded-2xl border border-zinc-300 bg-[var(--surface)]/90 p-4 font-mono shadow-lg dark:border-zinc-700"
        placeholder="KJFK 121651Z 18012KT 10SM FEW050 24/16 A2992"
      />

      {!raw.trim() ? (
        <p className="rounded-2xl border border-slate-500/30 bg-[var(--surface)]/80 p-4 text-zinc-600 dark:text-zinc-300">
          {pl ? "Wklej METAR albo wybierz próbkę, aby uruchomić dekoder." : "Add a METAR or choose a sample to start decoding."}
        </p>
      ) : (
        <div className="grid gap-5">
          <section className="rounded-3xl border border-zinc-300/20 bg-[var(--surface)]/90 p-5 shadow-xl">
            <h2 className="font-semibold">{pl ? "Mapa tokenów" : "Token map"}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {tokens.map((token, index) => {
                const info = tokenDescription(token);
                return (
                  <button key={`${token}-${index}`} onClick={() => setSelectedIndex(index)} title={pl ? info.pl : info.en} className={`rounded-xl border px-3 py-2 font-mono text-sm transition hover:-translate-y-0.5 ${severityClasses[info.severity]} ${selectedIndex === index ? "ring-2 ring-cyan-300" : ""}`}>
                    <span className="mr-2 rounded bg-black/20 px-1 text-[10px] font-bold">{info.label}</span>{token}
                  </button>
                );
              })}
            </div>
            {selectedInfo && <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-5"><p className="text-xs uppercase tracking-[0.2em] text-cyan-300">{pl ? "Wybrany token" : "Selected token"}</p><p className="mt-2 font-mono text-3xl font-black">{selectedToken}</p><p className="mt-2 text-sm text-slate-200">{pl ? selectedInfo.pl : selectedInfo.en}</p></div>}
          </section>

          {parsed && (
            <>
              <CockpitWeatherPanel metar={parsed} language={language} />
              <PilotBriefingCard metar={parsed} language={language} />
              <div className="rounded-3xl border border-zinc-300/20 bg-[var(--surface)]/90 p-5 text-sm shadow-xl">
                <h2 className="font-semibold">{pl ? "Zdekodowane grupy" : "Decoded groups"}</h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  <p><strong>Station:</strong> {parsed.station}</p>
                  <p><strong>Observed:</strong> {parsed.observedAt ?? "Unknown"}</p>
                  <p><strong>Wind:</strong> {parsed.wind ? `${parsed.wind.direction ?? "VRB"}° ${parsed.wind.speedKt}KT${parsed.wind.gustKt ? ` G${parsed.wind.gustKt}` : ""}${parsed.wind.variable ? ` variable ${parsed.wind.variable[0]}-${parsed.wind.variable[1]}` : ""}` : "Unknown"}</p>
                  <p><strong>Visibility:</strong> {parsed.visibility ? `${parsed.visibility.statuteMiles} SM (${parsed.visibility.raw})` : "Unknown"}</p>
                  <p><strong>Ceiling/Clouds:</strong> {parsed.clouds.length ? parsed.clouds.map((c) => `${c.coverage}${c.baseFtAgl ? ` ${c.baseFtAgl}ft` : ""}${c.cloudType ? ` ${c.cloudType}` : ""}`).join(", ") : "None reported"}</p>
                  <p><strong>Weather:</strong> {parsed.weatherCodes.length ? parsed.weatherCodes.join(", ") : "None"}</p>
                  <p><strong>RVR:</strong> {parsed.runwayVisualRange.length ? parsed.runwayVisualRange.map((rvr) => `${rvr.runway}: ${rvr.rangeFt ?? rvr.rangeMeters}${rvr.rangeFt ? " ft" : " m"}`).join(", ") : "None"}</p>
                  <p><strong>Altimeter:</strong> {parsed.altimeter ? parsed.altimeter.hectopascals ? `${parsed.altimeter.hectopascals} hPa` : `${parsed.altimeter.inchesHg.toFixed(2)} inHg` : "Unknown"}</p>
                  <p><strong>Flight category:</strong> {parsed.flightCategory}</p>
                </div>
              </div>
            </>
          )}

          <aside className="rounded-3xl border border-indigo-300/30 bg-indigo-500/10 p-5">
            <h2 className="font-semibold text-indigo-950 dark:text-indigo-100">{pl ? "Checklist instruktora" : "Instructor checklist"}</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-700 dark:text-zinc-200">
              <li>{pl ? "Znajdź stację i czas obserwacji." : "Find station and observation time."}</li>
              <li>{pl ? "Zdekoduj wiatr przed widzialnością." : "Decode wind before visibility."}</li>
              <li>{pl ? "Sprawdź BKN/OVC/VV jako podstawę chmur." : "Check BKN/OVC/VV for ceiling."}</li>
              <li>{pl ? "Użyj widzialności i podstawy dla VFR/MVFR/IFR/LIFR." : "Use visibility and ceiling for VFR/MVFR/IFR/LIFR."}</li>
            </ol>
            <Link href="/missions" className="mt-4 inline-flex rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400">{pl ? "Sprawdź w misji live" : "Try it in a live mission"}</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
