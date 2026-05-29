import type { FlightCategory, ParsedMetar } from "@/types/metar";
import type { SkillProgress } from "@/types/progress";
import { assessWeatherDecision } from "@/lib/decision/decisionEngine";

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

const SKILL_LABELS: Record<string, string> = {
  wind: "wiatr",
  visibility: "widzialność",
  clouds: "chmury i podstawa",
  altimeter: "QNH / altimeter",
  temperature: "temperatura i punkt rosy",
  weather: "pogoda bieżąca",
  taf: "TAF i trendy",
  scan: "pełny skan METAR",
};

export function skillLabel(skill: string): string {
  return SKILL_LABELS[skill] ?? skill;
}

export function formatWind(metar: ParsedMetar): string {
  if (!metar.wind) return "wiatr nie został podany";
  const direction = metar.wind.direction === null ? "VRB" : `${metar.wind.direction}°`;
  const gust = metar.wind.gustKt ? `, porywy do ${metar.wind.gustKt} kt` : "";
  const variable = metar.wind.variable ? `, zmienny ${metar.wind.variable[0]}°–${metar.wind.variable[1]}°` : "";
  return `${direction}, ${metar.wind.speedKt} kt${gust}${variable}`;
}

export function formatClouds(metar: ParsedMetar): string {
  if (!metar.clouds.length) return metar.visibility?.cavok ? "CAVOK — bez istotnych chmur" : "brak raportowanej podstawy";
  return metar.clouds
    .map((cloud) => `${cloud.coverage}${cloud.baseFtAgl ? ` ${cloud.baseFtAgl} ft` : ""}${cloud.cloudType ? ` ${cloud.cloudType}` : ""}`)
    .join(", ");
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
  const profileAssessment = assessWeatherDecision("ppl-vfr", metar);
  const alerts: string[] = profileAssessment.risks.map((risk) => risk.message);

  return {
    title: `${metar.station}: briefing ${category}`,
    summary: `${category}. Wiatr: ${formatWind(metar)}. Widzialność: ${metar.visibility?.raw ?? "bez ograniczeń"}. Chmury: ${formatClouds(metar)}.`,
    goDecision: profileAssessment.expected,
    tone: profileAssessment.expected === "NO-GO" ? "danger" : profileAssessment.expected === "CAUTION" ? "watch" : CATEGORY_TONE[category],
    primaryRisk: profileAssessment.primaryRisk,
    keyToken: profileAssessment.keyToken || getKeyToken(metar),
    alerts: alerts.slice(0, 5),
    trainingFocus: `ćwicz obszar: ${skillLabel(profileAssessment.trainingFocus)}`,
  };
}

export function getPilotRank(stats: { totalAnswered: number; accuracy: number; bestTimeAttack: number }): { rank: string; progress: number; next: string } {
  const score = stats.totalAnswered + stats.accuracy + stats.bestTimeAttack * 4;
  if (score >= 260) return { rank: "Mistrz pogody", progress: 100, next: "Utrzymaj elitarny poziom w misjach na żywo." };
  if (score >= 180) return { rank: "Uczeń IFR", progress: Math.round(((score - 180) / 80) * 100), next: "Zdobądź 260 XP pilota, aby odblokować rangę Mistrz pogody." };
  if (score >= 100) return { rank: "Pilot turystyczny", progress: Math.round(((score - 100) / 80) * 100), next: "Zdobądź 180 XP pilota, aby wejść na poziom Uczeń IFR." };
  return { rank: "Uczeń pilot", progress: Math.round(score), next: "Zdobądź 100 XP pilota, aby odblokować rangę Pilot turystyczny." };
}

export function buildTrainingPlan(skills: SkillProgress[]): string[] {
  if (!skills.length) {
    return ["Rozkoduj jeden przykładowy METAR token po tokenie.", "Ukończ jedną klasyczną rundę quizu.", "Wczytaj pogodę na żywo dla najbliższego lotniska ICAO."];
  }

  const scored = skills
    .map((skill) => {
      const total = skill.correct + skill.incorrect;
      return { skill: skill.skillTag, accuracy: total ? skill.correct / total : 0, total };
    })
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total);
  const weakest = scored[0];
  const label = skillLabel(weakest.skill);

  return [
    `Rozgrzewka: 3 przykłady METAR z naciskiem na ${label}.`,
    `Ćwiczenie: 10 pytań quizowych — po każdej odpowiedzi przeczytaj wyjaśnienie (${label}).`,
    "Misja: wczytaj METAR na żywo i podejmij decyzję GO / CAUTION / NO-GO.",
  ];
}
