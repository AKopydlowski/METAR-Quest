import type { ParsedMetar } from "@/types/metar";
import { parseMetar } from "@/lib/metar/parser";

export interface AviationWeatherClient {
  getLatestMetar(station: string): Promise<ParsedMetar>;
}

const BASE_URL = "https://aviationweather.gov/api/data/metar";

export async function getLatestMetar(station: string): Promise<ParsedMetar> {
  const url = `${BASE_URL}?ids=${encodeURIComponent(station)}&format=raw&taf=false`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to fetch METAR for ${station}: ${response.status}`);
  }

  const raw = (await response.text()).trim();
  if (!raw) {
    throw new Error(`No METAR returned for ${station}`);
  }

  return parseMetar(raw.split("\n")[0]);
}

export const aviationWeatherClient: AviationWeatherClient = {
  getLatestMetar,
};
