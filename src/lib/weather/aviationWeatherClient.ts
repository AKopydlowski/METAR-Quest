import type { ParsedMetar } from "@/types/metar";
import { parseMetar } from "@/lib/metar/parser";

export interface AviationWeatherClient {
  getLatestMetar(station: string): Promise<ParsedMetar>;
  getLatestTaf(station: string): Promise<string | null>;
}

const METAR_URL = "https://aviationweather.gov/api/data/metar";
const TAF_URL = "https://aviationweather.gov/api/data/taf";
const REQUEST_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { next: { revalidate: 60 }, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function getLatestMetar(station: string): Promise<ParsedMetar> {
  const url = `${METAR_URL}?ids=${encodeURIComponent(station)}&format=raw&taf=false`;
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch METAR for ${station}: ${response.status}`);
  }

  const raw = (await response.text()).trim();
  if (!raw) {
    throw new Error(`No METAR returned for ${station}`);
  }

  return parseMetar(raw.split("\n")[0]);
}

export async function getLatestTaf(station: string): Promise<string | null> {
  const url = `${TAF_URL}?ids=${encodeURIComponent(station)}&format=raw`;
  const response = await fetchWithTimeout(url);
  if (!response.ok) return null;

  const raw = (await response.text()).trim();
  return raw ? raw.split("\n").filter(Boolean).join("\n") : null;
}

export const aviationWeatherClient: AviationWeatherClient = {
  getLatestMetar,
  getLatestTaf,
};
