import type { FlightCategory, ParsedMetar } from "@/types/metar";
import type { SkillProgress } from "@/types/progress";

export type BriefingTone = "calm" | "watch" | "danger";

export type PilotBriefing = {
  title: string;
  summary: string;
  goDecision: "GO" | "CAUTION" | "NO-GO";
  tone: BriefingTone;
  primaryRisk: string;
  keyToken: string;
  alerts: string[];
  trainingFocus: string;
};

const CATEGORY_TONE: Record<FlightCategory, BriefingTone> = {
  VFR: "calm",
  MVFR: "watch",
  IFR: "danger",
  LIFR: "danger",
};

export function formatWind(metar: ParsedMetar): string {
  if (!metar.wind) return "wind not reported";
  const direction = metar.wind.direction === null ? "VRB" : `${metar.wind.direction}°`;
  const gust = metar.wind.gustKt ? ` gusting ${metar.wind.gustKt} kt` : "";
  const variable = metar.wind.variable ? `, variable ${metar.wind.variable[0]}°-${metar.wind.variable[1]}°` : "";
  return `${direction} at ${metar.wind.speedKt} kt${gust}${variable}`;
}

export function formatClouds(metar: ParsedMetar): string {
  if (!metar.clouds.length) return metar.visibility?.cavok ? "CAVOK / no significant cloud" : "no ceiling reported";
  return metar.clouds
    .map((cloud) => `${cloud.coverage}${cloud.baseFtAgl ? ` ${cloud.baseFtAgl} ft` : ""}${cloud.cloudType ? ` ${cloud.cloudType}` : ""}`)
    .join(", ");
}

function lowestCeiling(metar: ParsedMetar): number | undefined {
  return metar.clouds
    .filter((cloud) => ["BKN", "OVC", "VV"].includes(cloud.coverage) && cloud.baseFtAgl)
    .map((cloud) => cloud.baseFtAgl as number)
    .sort((a, b) => a - b)[0];
}

function getKeyToken(metar: ParsedMetar): string {
  const tokens = metar.rawText.split(/\s+/);
  const ceiling = tokens.find((token) => /^(BKN|OVC|VV)\d{3}/.test(token));
  const weather = tokens.find((token) => metar.weatherCodes.includes(token));
  const rvr = tokens.find((token) => /^R\d{2}[LCR]?\//.test(token));
  const visibility = metar.visibility?.raw;
  const gust = tokens.find((token) => /^\d{3}\d{2,3}G\d{2,3}KT$/.test(token));
  return rvr ?? weather ?? ceiling ?? visibility ?? gust ?? tokens[0] ?? "METAR";
}

export function buildPilotBriefing(metar: ParsedMetar): PilotBriefing {
  const category = metar.flightCategory ?? "VFR";
  const alerts: string[] = [];
  const ceiling = lowestCeiling(metar);
  const visibility = metar.visibility?.statuteMiles ?? 10;

  if (category === "LIFR") alerts.push("Very low ceiling/visibility: treat as a serious instrument-weather scenario.");
  else if (category === "IFR") alerts.push("Instrument conditions: VFR training should stop here unless this is a simulator scenario.");
  else if (category === "MVFR") alerts.push("Marginal VFR: continue only with strong situational awareness and alternates.");
  else alerts.push("VFR baseline: no major category restriction detected from visibility/ceiling.");

  if (ceiling && ceiling <= 3000) alerts.push(`Ceiling driver: ${ceiling} ft AGL.`);
  if (visibility <= 5) alerts.push(`Visibility driver: ${metar.visibility?.raw ?? visibility} reported.`);
  if (metar.wind?.gustKt) alerts.push(`Gust spread: ${metar.wind.gustKt - metar.wind.speedKt} kt above steady wind.`);
  if (metar.weatherCodes.length) alerts.push(`Present weather: ${metar.weatherCodes.join(", ")}.`);
  if (metar.runwayVisualRange.length) alerts.push("RVR is reported, so runway-specific visibility matters.");
  if (metar.trend?.includes("TEMPO")) alerts.push("TEMPO trend: short-term conditions may differ from the main report.");

  const primaryRisk =
    category === "VFR"
      ? metar.wind?.gustKt
        ? "gust management"
        : "maintaining scan discipline"
      : ceiling && visibility <= 5
        ? "low ceiling and restricted visibility"
        : ceiling
          ? "ceiling"
          : visibility <= 5
            ? "visibility"
            : "weather deterioration";

  return {
    title: `${metar.station} ${category} briefing`,
    summary: `${category} with ${formatWind(metar)}, visibility ${metar.visibility?.raw ?? "not limited"}, clouds ${formatClouds(metar)}.`,
    goDecision: category === "VFR" ? "GO" : category === "MVFR" ? "CAUTION" : "NO-GO",
    tone: CATEGORY_TONE[category],
    primaryRisk,
    keyToken: getKeyToken(metar),
    alerts: alerts.slice(0, 5),
    trainingFocus: category === "VFR" ? "speed-read wind, visibility and QNH" : "identify the exact token that changes the flight category",
  };
}

export function getPilotRank(stats: { totalAnswered: number; accuracy: number; bestTimeAttack: number }): { rank: string; progress: number; next: string } {
  const score = stats.totalAnswered + stats.accuracy + stats.bestTimeAttack * 4;
  if (score >= 260) return { rank: "Weather Ninja", progress: 100, next: "Keep defending your elite status with live missions." };
  if (score >= 180) return { rank: "Instrument Student", progress: Math.round(((score - 180) / 80) * 100), next: "Reach 260 pilot XP for Weather Ninja." };
  if (score >= 100) return { rank: "Private Pilot", progress: Math.round(((score - 100) / 80) * 100), next: "Reach 180 pilot XP for Instrument Student." };
  return { rank: "Student Pilot", progress: Math.round(score), next: "Reach 100 pilot XP for Private Pilot." };
}

export function buildTrainingPlan(skills: SkillProgress[]): string[] {
  if (!skills.length) {
    return ["Decode one sample METAR token-by-token.", "Finish one Classic quiz.", "Load live weather for your nearest ICAO station."];
  }

  const scored = skills
    .map((skill) => {
      const total = skill.correct + skill.incorrect;
      return { skill: skill.skillTag, accuracy: total ? skill.correct / total : 0, total };
    })
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total);
  const weakest = scored[0];

  return [
    `Warm-up: 3 decoded examples focused on ${weakest.skill}.`,
    `Drill: 10 quiz questions; stop and read every explanation for ${weakest.skill}.`,
    "Mission: load a live METAR and make a GO / CAUTION / NO-GO call.",
  ];
}
