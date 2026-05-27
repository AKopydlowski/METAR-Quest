"use client";

import { useState } from "react";

interface ApiResponse {
  station: string;
  metar?: {
    rawText: string;
    flightCategory?: string;
    visibility?: { statuteMiles: number };
    wind?: { direction: number | null; speedKt: number };
    temperature?: { celsius: number; dewpointCelsius: number };
  };
  error?: string;
}

export default function RealWeatherPage() {
  const [station, setStation] = useState("");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const loadWeather = async () => {
    if (!station.trim()) return;
    setLoading(true);
    const response = await fetch(`/api/weather/metar?station=${encodeURIComponent(station)}`);
    const payload = (await response.json()) as ApiResponse;
    setData(payload);
    setLoading(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Real Weather</h1>
      <p className="mt-2 text-sm text-zinc-500">Live METAR (AviationWeather.gov API)</p>
      <div className="mt-4 flex gap-2">
        <input
          value={station}
          onChange={(e) => setStation(e.target.value.toUpperCase())}
          className="w-full rounded border border-zinc-400 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
          placeholder="ICAO, np. KEPPO"
        />
        <button onClick={loadWeather} className="rounded bg-sky-500 px-4 py-2 text-white disabled:opacity-50" disabled={loading || !station.trim()}>{loading ? "Loading..." : "Load"}</button>
      </div>
      <div className="mt-4 rounded border border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900/60">
        {!data && <p>No weather loaded yet.</p>}
        {data?.error && <p className="text-rose-500">{data.error}</p>}
        {data?.metar && (
          <div className="space-y-1 text-sm">
            <p><strong>Raw:</strong> {data.metar.rawText}</p>
            <p><strong>Category:</strong> {data.metar.flightCategory ?? "Unknown"}</p>
            <p><strong>Visibility:</strong> {data.metar.visibility?.statuteMiles ?? "?"} SM</p>
            <p><strong>Wind:</strong> {data.metar.wind ? `${data.metar.wind.direction ?? "VRB"}° ${data.metar.wind.speedKt}KT` : "Unknown"}</p>
            <p><strong>Temp/Dew:</strong> {data.metar.temperature ? `${data.metar.temperature.celsius}/${data.metar.temperature.dewpointCelsius}°C` : "Unknown"}</p>
          </div>
        )}
      </div>
    </main>
  );
}
