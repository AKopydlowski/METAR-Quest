import type { ParsedMetar } from "@/types/metar";
import { PILOT_PROFILES, type MissionProfile, type PilotDecision } from "./profiles.ts";
import { findToken, getGustSpreadKt, getLowestCeilingFt, hasWeatherMatch, type WeatherRisk } from "./weatherRisk.ts";

export type DecisionAssessment = {
  profile: MissionProfile;
  expected: PilotDecision;
  match: boolean;
  score: number;
  primaryRisk: string;
  keyToken: string;
  risks: WeatherRisk[];
  trainingFocus: string;
  whatWouldImprove: string[];
};

function decisionFromRisks(risks: WeatherRisk[]): PilotDecision {
  if (risks.some((risk) => risk.severity === "danger")) return "NO-GO";
  if (risks.some((risk) => risk.severity === "caution")) return "CAUTION";
  return "GO";
}

function firstImportantRisk(risks: WeatherRisk[]): WeatherRisk | undefined {
  return risks.find((risk) => risk.severity === "danger") ?? risks.find((risk) => risk.severity === "caution") ?? risks[0];
}

export function assessWeatherDecision(profileId: MissionProfile, metar: ParsedMetar, decision?: PilotDecision): DecisionAssessment {
  const profile = PILOT_PROFILES[profileId];
  const minima = profile.minima;
  const risks: WeatherRisk[] = [];
  const visibility = metar.visibility?.statuteMiles ?? 10;
  const ceiling = getLowestCeilingFt(metar) ?? 100000;
  const gustSpread = getGustSpreadKt(metar);
  const weatherHit = hasWeatherMatch(metar, minima.forbiddenWeather);

  if (visibility < minima.minimumVisibilitySm) {
    risks.push({
      id: "visibility-minimum",
      severity: "danger",
      token: metar.visibility?.raw ?? findToken(metar, /SM$|^\d{4}$|CAVOK/),
      message: `Visibility ${metar.visibility?.raw ?? visibility} is below ${profile.label} minimum (${minima.minimumVisibilitySm} SM).`,
      skillTag: "visibility",
    });
  } else if (visibility < minima.cautionVisibilitySm) {
    risks.push({
      id: "visibility-caution",
      severity: "caution",
      token: metar.visibility?.raw ?? findToken(metar, /SM$|^\d{4}$|CAVOK/),
      message: `Visibility is usable but inside the caution band for ${profile.label}.`,
      skillTag: "visibility",
    });
  }

  if (ceiling < minima.minimumCeilingFt) {
    risks.push({
      id: "ceiling-minimum",
      severity: "danger",
      token: findToken(metar, /^(BKN|OVC|VV)\d{3}/),
      message: `Ceiling ${ceiling} ft is below ${profile.label} minimum (${minima.minimumCeilingFt} ft).`,
      skillTag: "clouds",
    });
  } else if (ceiling < minima.cautionCeilingFt) {
    risks.push({
      id: "ceiling-caution",
      severity: "caution",
      token: findToken(metar, /^(BKN|OVC|VV)\d{3}/),
      message: `Ceiling ${ceiling} ft is marginal for this profile.`,
      skillTag: "clouds",
    });
  }

  if (metar.wind && metar.wind.speedKt > minima.maxWindKt) {
    risks.push({
      id: "wind-speed",
      severity: "danger",
      token: findToken(metar, /KT$/),
      message: `Wind ${metar.wind.speedKt} kt exceeds this profile's wind limit (${minima.maxWindKt} kt).`,
      skillTag: "wind",
    });
  } else if (gustSpread > minima.maxGustSpreadKt) {
    risks.push({
      id: "gust-spread",
      severity: "caution",
      token: findToken(metar, /G\d{2,3}KT$/),
      message: `Gust spread ${gustSpread} kt requires extra handling margin.`,
      skillTag: "wind",
    });
  }

  if (weatherHit) {
    risks.push({
      id: "forbidden-weather",
      severity: weatherHit.includes("TS") || weatherHit.includes("FZ") || weatherHit.startsWith("+") ? "danger" : "caution",
      token: weatherHit,
      message: `${weatherHit} is a profile-specific threat for ${profile.label}.`,
      skillTag: "weather",
    });
  }

  if (metar.runwayVisualRange.length) {
    risks.push({
      id: "rvr",
      severity: "caution",
      token: metar.runwayVisualRange[0].raw,
      message: "RVR is reported, so runway-specific visibility must be briefed.",
      skillTag: "visibility",
    });
  }

  if (metar.trend?.some((token) => token === "TEMPO" || token === "BECMG" || token.startsWith("PROB"))) {
    risks.push({
      id: "trend",
      severity: "caution",
      token: metar.trend[0],
      message: "Trend group suggests the current snapshot may change during the mission window.",
      skillTag: "taf",
    });
  }

  if (!risks.length) {
    risks.push({
      id: "vfr-baseline",
      severity: "info",
      token: metar.flightCategory ?? "VFR",
      message: "No profile-specific stopper detected; keep a normal scan of wind, visibility, ceiling and trend.",
      skillTag: "scan",
    });
  }

  const expected = decisionFromRisks(risks);
  const primary = firstImportantRisk(risks);
  const whatWouldImprove = risks
    .filter((risk) => risk.severity !== "info")
    .slice(0, 3)
    .map((risk) => {
      if (risk.skillTag === "visibility") return `Visibility above ${minima.cautionVisibilitySm} SM would move this closer to GO.`;
      if (risk.skillTag === "clouds") return `Ceiling above ${minima.cautionCeilingFt} ft would reduce the profile risk.`;
      if (risk.skillTag === "wind") return `Lower steady wind or gust spread below ${minima.maxGustSpreadKt} kt would reduce handling risk.`;
      if (risk.skillTag === "weather") return `Removing ${risk.token} from the report would reduce operational threat.`;
      return `Re-check ${risk.token} before changing the call.`;
    });

  return {
    profile: profileId,
    expected,
    match: decision ? decision === expected : false,
    score: decision ? (decision === expected ? 100 : expected === "CAUTION" || decision === "CAUTION" ? 65 : 35) : 0,
    primaryRisk: primary?.message ?? "No major risk detected.",
    keyToken: primary?.token ?? metar.flightCategory ?? "METAR",
    risks,
    trainingFocus: primary?.skillTag ?? "scan",
    whatWouldImprove: whatWouldImprove.length ? whatWouldImprove : ["Keep monitoring TAF and nearby alternates before launch."],
  };
}
