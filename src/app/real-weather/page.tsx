"use client";

import { FormEvent, useState } from "react";
import CockpitWeatherPanel from "@/components/metar/CockpitWeatherPanel";
import PilotBriefingCard from "@/components/metar/PilotBriefingCard";
import TafTimeline from "@/components/metar/TafTimeline";
import { useLanguage } from "@/components/layout/LanguageProvider";
import type { ParsedMetar } from "@/types/metar";

interface ApiResponse {
  station: string;
  metar?: ParsedMetar;
  taf?: string;
  error?: string;
}

const HISTORY_KEY = "metar-quest:weather-history";
const FAVORITES_KEY = "metar-quest:favorite-stations";
const WEATHER_CACHE_KEY = "metar-quest:last-weather:";
const QUICK_STATIONS = ["EPWA", "EPKK", "EPPO", "EPGD", "EPWR", "KJFK", "EGLL"];
const AIRPORTS = [
  { code: "EPWA", city: "Warsaw", x: 54, y: 42 },
  { code: "EPKK", city: "Kraków", x: 55, y: 64 },
  { code: "EPPO", city: "Poznań", x: 36, y: 48 },
  { code: "EPGD", city: "Gdańsk", x: 47, y: 18 },
  { code: "EPWR", city: "Wrocław", x: 35, y: 65 },
  { code: "KJFK", city: "New York", x: 16, y: 54 },
  { code: "EGLL", city: "London", x: 43, y: 50 },
];

function loadCachedWeather(station: string): ApiResponse | null {
  if (typeof window === "undefined") return null;
  const saved = window.localStorage.getItem(`${WEATHER_CACHE_KEY}${station}`);
  if (!saved) return null;
  try {
    return JSON.parse(saved) as ApiResponse;
  } catch {
    return null;
  }
}

function observationLabel(observedAt?: string) {
  if (!observedAt) return "Observation time unknown";
  return `Observed ${observedAt.slice(0, 2)} day at ${observedAt.slice(2, 4)}:${observedAt.slice(4, 6)}Z`;
}

function loadStringList(key: string): string[] {
  if (typeof window === "undefined") return [];
  const saved = window.localStorage.getItem(key);
  if (!saved) return [];
  try {
    return JSON.parse(saved) as string[];
  } catch {
    return [];
  }
}

export default function RealWeatherPage() {
  const { t, language } = useLanguage();
  const pl = language === "pl";
  const [station, setStation] = useState("");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>(() => loadStringList(HISTORY_KEY));
  const [favorites, setFavorites] = useState<string[]>(() => loadStringList(FAVORITES_KEY));
  const [error, setError] = useState<string | null>(null);
  const [departureHour, setDepartureHour] = useState(12);
  const [arrivalHour, setArrivalHour] = useState(14);

  const rememberStation = (code: string) => {
    const next = [code, ...history.filter((item) => item !== code)].slice(0, 8);
    setHistory(next);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  };

  const toggleFavorite = (code: string) => {
    const normalized = code.trim().toUpperCase();
    if (!/^[A-Z]{4}$/.test(normalized)) return;
    const next = favorites.includes(normalized) ? favorites.filter((item) => item !== normalized) : [normalized, ...favorites].slice(0, 12);
    setFavorites(next);
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
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
      else {
        rememberStation(normalized);
        window.localStorage.setItem(`${WEATHER_CACHE_KEY}${normalized}`, JSON.stringify(payload));
      }
    } catch {
      const cached = loadCachedWeather(normalized);
      if (cached?.metar) {
        setData(cached);
        setError(pl ? "Pokazuję ostatni zapisany raport — live API jest niedostępne." : "Showing last saved report — live API is unavailable.");
      } else {
        setError(pl ? "Nie udało się pobrać pogody. Spróbuj ponownie." : "Could not load weather. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void loadWeather();
  };

  const stationButtons = [...favorites, ...QUICK_STATIONS, ...history].filter((item, index, arr) => arr.indexOf(item) === index);

  return (
    <div className="w-full space-y-5">
      <section className="rounded-[2rem] border border-sky-300/20 bg-slate-950/75 p-6 text-white shadow-2xl shadow-sky-950/30">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">{t("weatherSource")}</p>
            <h1 className="mt-2 text-4xl font-black">{pl ? "Live briefing pogodowy" : "Live weather briefing"}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              {pl ? "Wczytaj METAR/TAF, zapisz ulubione lotniska i zobacz TAF jako oś czasu ryzyka." : "Load METAR/TAF, save favorite airports and review TAF as a risk timeline."}
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
            <button type="button" onClick={() => toggleFavorite(station)} className="rounded-xl border border-cyan-300/40 px-4 py-3 font-bold text-cyan-100">★</button>
          </form>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {stationButtons.map((code) => (
            <button key={code} onClick={() => void loadWeather(code)} className="rounded-full border border-cyan-300/30 px-3 py-1 text-xs font-bold text-cyan-100 hover:bg-cyan-500/10">{favorites.includes(code) ? "★ " : ""}{code}</button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-500/30 bg-[var(--surface)]/90 p-5 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">{pl ? "Mapa szybkiego wyboru" : "Quick airport map"}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-300">{pl ? "Kliknij lotnisko, aby pobrać bieżące warunki." : "Click an airport to fetch current conditions."}</p>
          </div>
          <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">{favorites.length} ★</span>
        </div>
        <div className="relative mt-4 h-64 overflow-hidden rounded-3xl border border-sky-300/20 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.22),rgba(15,23,42,0.92))]">
          <div className="absolute inset-6 rounded-[2rem] border border-white/10" />
          {AIRPORTS.map((airport) => (
            <button
              key={airport.code}
              onClick={() => void loadWeather(airport.code)}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-cyan-300/40 bg-slate-950/80 px-3 py-2 text-left text-xs text-white shadow-lg hover:bg-cyan-500/30"
              style={{ left: `${airport.x}%`, top: `${airport.y}%` }}
            >
              <span className="block font-mono font-black">{airport.code}</span>
              <span className="text-slate-300">{airport.city}</span>
            </button>
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
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">{observationLabel(data.metar.observedAt)} • educational briefing, not operational dispatch.</p>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <p><strong>Category:</strong> {data.metar.flightCategory ?? "Unknown"}</p>
              <p><strong>Visibility:</strong> {data.metar.visibility?.raw ?? "?"} ({data.metar.visibility?.statuteMiles ?? "?"} SM)</p>
              <p><strong>Wind:</strong> {data.metar.wind ? `${data.metar.wind.direction ?? "VRB"}° ${data.metar.wind.speedKt}KT${data.metar.wind.gustKt ? ` G${data.metar.wind.gustKt}` : ""}` : "Unknown"}</p>
              <p><strong>Temp/Dew:</strong> {data.metar.temperature ? `${data.metar.temperature.celsius}/${data.metar.temperature.dewpointCelsius}°C` : "Unknown"}</p>
              <p><strong>Weather:</strong> {data.metar.weatherCodes?.length ? data.metar.weatherCodes.join(", ") : "None"}</p>
              <p><strong>Trend:</strong> {data.metar.trend?.length ? data.metar.trend.join(", ") : "None"}</p>
            </div>
          </section>

          <section className="rounded-3xl border border-indigo-300/20 bg-indigo-500/10 p-5 shadow-xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-xl font-bold">{pl ? "Oś czasu TAF" : "TAF timeline"}</h2>
                <p className="mt-1 text-sm text-slate-400">{pl ? "Ustaw okno misji, aby zobaczyć ryzyko prognozowane dla lotu." : "Set a mission window to highlight forecast risk for the flight."}</p>
              </div>
              <div className="flex gap-2">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-400">DEP Z
                  <input type="number" min={0} max={23} value={departureHour} onChange={(event) => setDepartureHour(Number(event.target.value))} className="mt-1 block w-20 rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-white" />
                </label>
                <label className="text-xs font-bold uppercase tracking-wide text-slate-400">ARR Z
                  <input type="number" min={0} max={23} value={arrivalHour} onChange={(event) => setArrivalHour(Number(event.target.value))} className="mt-1 block w-20 rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-white" />
                </label>
              </div>
            </div>
            <div className="mt-4">
              <TafTimeline taf={data.taf} language={language} departureHour={departureHour} arrivalHour={arrivalHour} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
