"use client";

import { FormEvent, useState } from "react";
import { useLanguage } from "@/components/layout/LanguageProvider";

interface ApiResponse {
  station: string;
  metar?: {
    rawText: string;
    flightCategory?: string;
    visibility?: { statuteMiles: number };
    wind?: { direction: number | null; speedKt: number; gustKt?: number };
    temperature?: { celsius: number; dewpointCelsius: number };
    weatherCodes?: string[];
    runwayVisualRange?: Array<{ runway: string; rangeFt?: number; rangeMeters?: number }>;
    trend?: string[];
  };
  taf?: string;
  error?: string;
}

const HISTORY_KEY = "metar-quest:weather-history";
const QUICK_STATIONS = ["EPWA", "EPPO", "KJFK", "EGLL"];

export default function RealWeatherPage() {
  const { t, language } = useLanguage();
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
      setError(language === "pl" ? "Podaj poprawny 4-literowy kod ICAO." : "Enter a valid 4-letter ICAO code.");
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
      setError(language === "pl" ? "Nie udało się pobrać pogody. Spróbuj ponownie." : "Could not load weather. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void loadWeather();
  };

  return (
    <main className="mx-auto w-full max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">{t("realWeather")}</h1>
      <p className="mt-2 text-sm text-zinc-500">{t("weatherSource")}</p>
      <form onSubmit={onSubmit} className="mt-4 flex gap-2">
        <input
          value={station}
          maxLength={4}
          onChange={(e) => setStation(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
          className="w-full rounded border border-zinc-400 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
          placeholder={language === "pl" ? "ICAO, np. EPPO" : "ICAO, e.g. KJFK"}
        />
        <button className="rounded bg-sky-500 px-4 py-2 text-white disabled:opacity-50" disabled={loading || !station.trim()}>{loading ? t("loading") : t("load")}</button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {[...QUICK_STATIONS, ...history].filter((item, index, arr) => arr.indexOf(item) === index).map((code) => (
          <button key={code} onClick={() => void loadWeather(code)} className="rounded-full border px-3 py-1 text-xs hover:bg-sky-500/10">{code}</button>
        ))}
      </div>

      <div className="mt-4 rounded border border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900/60">
        {!data && !error && <p>{t("noWeather")}</p>}
        {error && <p className="text-rose-500">{error}</p>}
        {data?.metar && (
          <div className="space-y-2 text-sm">
            <p><strong>Raw:</strong> <span className="font-mono">{data.metar.rawText}</span></p>
            <div className="grid gap-2 sm:grid-cols-2">
              <p><strong>Category:</strong> {data.metar.flightCategory ?? "Unknown"}</p>
              <p><strong>Visibility:</strong> {data.metar.visibility?.statuteMiles ?? "?"} SM</p>
              <p><strong>Wind:</strong> {data.metar.wind ? `${data.metar.wind.direction ?? "VRB"}° ${data.metar.wind.speedKt}KT${data.metar.wind.gustKt ? ` G${data.metar.wind.gustKt}` : ""}` : "Unknown"}</p>
              <p><strong>Temp/Dew:</strong> {data.metar.temperature ? `${data.metar.temperature.celsius}/${data.metar.temperature.dewpointCelsius}°C` : "Unknown"}</p>
              <p><strong>Weather:</strong> {data.metar.weatherCodes?.length ? data.metar.weatherCodes.join(", ") : "None"}</p>
              <p><strong>Trend:</strong> {data.metar.trend?.length ? data.metar.trend.join(", ") : "None"}</p>
            </div>
            {data.taf && <div className="mt-4 rounded-xl border border-indigo-300/30 bg-indigo-500/10 p-3"><p className="font-semibold">TAF</p><p className="mt-1 whitespace-pre-wrap font-mono text-xs">{data.taf}</p></div>}
          </div>
        )}
      </div>
    </main>
  );
}
