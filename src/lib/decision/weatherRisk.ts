import type { ParsedMetar } from "@/types/metar";

export type WeatherRiskSeverity = "info" | "caution" | "danger";

export type WeatherRisk = {
  id: string;
  severity: WeatherRiskSeverity;
  token: string;
  message: string;
  skillTag: string;
};

export function getLowestCeilingFt(metar: ParsedMetar): number | undefined {
  return metar.clouds
    .filter((cloud) => ["BKN", "OVC", "VV"].includes(cloud.coverage) && cloud.baseFtAgl)
    .map((cloud) => cloud.baseFtAgl as number)
    .sort((a, b) => a - b)[0];
}

export function getGustSpreadKt(metar: ParsedMetar): number {
  if (!metar.wind?.gustKt) return 0;
  return Math.max(0, metar.wind.gustKt - metar.wind.speedKt);
}

export function hasWeatherMatch(metar: ParsedMetar, patterns: string[]): string | undefined {
  return metar.weatherCodes.find((code) => patterns.some((pattern) => code.includes(pattern)));
}

export function findToken(metar: ParsedMetar, matcher: RegExp, fallback = "METAR"): string {
  return metar.rawText.split(/\s+/).find((token) => matcher.test(token)) ?? fallback;
}
