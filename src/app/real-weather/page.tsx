"use client";

import { FormEvent, useState } from "react";
import CockpitWeatherPanel from "@/components/metar/CockpitWeatherPanel";
import PilotBriefingCard from "@/components/metar/PilotBriefingCard";
import { useLanguage } from "@/components/layout/LanguageProvider";
import type { ParsedMetar } from "@/types/metar";

interface ApiResponse {
  station: string;
  metar?: ParsedMetar;
  taf?: string;
  error?: string;
}

const HISTORY_KEY = "metar-quest:weather-history";
const QUICK_STATIONS = ["EPWA", "EPPO", "KJFK", "EGLL"];

export default function RealWeatherPage() {
  const { t, language } = useLanguage();
  const pl = language === "pl";
  const [station, setStation] = useState("");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = window.localStorage.getItem(HISTORY_KEY);
    return saved ? (JSON.parse(saved) as string[]) : [];
  });
  const [error, setError] = useState<string | null>(null);

  const rememberStation = (code: string) => {
    const next = [code, ...history.filter((item) => item !== code)].slice(0, 6);
    setHistory(next);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  };

  const loadWeather = async (code = station) => {
    const normalized = code.trim().toUpperCase();
    if (!/^[A-Z]{4}$/.test(normalized)) {
      setError(pl ? "Podaj poprawny 4-literowy kod ICAO." : "Enter a valid 4-letter ICAO code.");
      return;
    }

    setStation(normalized);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/weather/metar?station=${encodeURIComponent(normalized)}&taf=true`);
      const payload = (await response.json()) as ApiResponse;
      setData(payload);
      if (payload.error) setError(payload.error);
      else rememberStation(normalized);
    } catch {
      setError(pl ? "Nie udało się pobrać pogody. Spróbuj ponownie." : "Could not load weather. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void loadWeather();
  };

  return (
    <div className="w-full space-y-5">
      <section className="rounded-[2rem] border border-sky-300/20 bg-slate-950/75 p-6 text-white shadow-2xl shadow-sky-950/30">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">{t("weatherSource")}</p>
            <h1 className="mt-2 text-4xl font-black">{pl ? "Live briefing pogodowy" : "Live weather briefing"}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              {pl ? "Wczytaj realny METAR/TAF i zobacz interpretację w formie kokpitu: kategoria, token krytyczny, ryzyko i rekomendowany trening." : "Load real METAR/TAF and get a cockpit-style interpretation: category, critical token, risk and recommended practice."}
            </p>
          </div>
          <form onSubmit={onSubmit} className="flex min-w-0 gap-2">
            <input
              value={station}
              maxLength={4}
              onChange={(e) => setStation(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
              className="min-w-0 rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 font-mono text-white placeholder:text-slate-500"
              placeholder={pl ? "ICAO, np. EPPO" : "ICAO, e.g. KJFK"}
            />
            <button className="rounded-xl bg-cyan-300 px-5 py-3 font-bold text-slate-950 disabled:opacity-50" disabled={loading || !station.trim()}>{loading ? t("loading") : t("load")}</button>
          </form>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[...QUICK_STATIONS, ...history].filter((item, index, arr) => arr.indexOf(item) === index).map((code) => (
            <button key={code} onClick={() => void loadWeather(code)} className="rounded-full border border-cyan-300/30 px-3 py-1 text-xs font-bold text-cyan-100 hover:bg-cyan-500/10">{code}</button>
          ))}
        </div>
      </section>

      {error && <p className="rounded-2xl border border-rose-300/30 bg-rose-500/10 p-4 text-rose-200">{error}</p>}
      {!data?.metar && !error && <p className="rounded-2xl border border-slate-500/30 bg-[var(--surface)]/80 p-4">{t("noWeather")}</p>}

      {data?.metar && (
        <>
          <CockpitWeatherPanel metar={data.metar} language={language} />
          <PilotBriefingCard metar={data.metar} language={language} />
          <section className="rounded-3xl border border-zinc-300/20 bg-[var(--surface)]/90 p-5 shadow-xl">
            <p><strong>Raw:</strong> <span className="font-mono text-sm">{data.metar.rawText}</span></p>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <p><strong>Category:</strong> {data.metar.flightCategory ?? "Unknown"}</p>
              <p><strong>Visibility:</strong> {data.metar.visibility?.statuteMiles ?? "?"} SM</p>
              <p><strong>Wind:</strong> {data.metar.wind ? `${data.metar.wind.direction ?? "VRB"}° ${data.metar.wind.speedKt}KT${data.metar.wind.gustKt ? ` G${data.metar.wind.gustKt}` : ""}` : "Unknown"}</p>
              <p><strong>Temp/Dew:</strong> {data.metar.temperature ? `${data.metar.temperature.celsius}/${data.metar.temperature.dewpointCelsius}°C` : "Unknown"}</p>
              <p><strong>Weather:</strong> {data.metar.weatherCodes?.length ? data.metar.weatherCodes.join(", ") : "None"}</p>
              <p><strong>Trend:</strong> {data.metar.trend?.length ? data.metar.trend.join(", ") : "None"}</p>
            </div>
            {data.taf && <div className="mt-4 rounded-xl border border-indigo-300/30 bg-indigo-500/10 p-3"><p className="font-semibold">TAF</p><p className="mt-1 whitespace-pre-wrap font-mono text-xs">{data.taf}</p></div>}
          </section>
        </>
      )}
    </div>
  );
}
