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
      message: `Widzialność ${metar.visibility?.raw ?? visibility} jest poniżej minimum profilu ${profile.pl} (${minima.minimumVisibilitySm} SM).`,
      skillTag: "visibility",
    });
  } else if (visibility < minima.cautionVisibilitySm) {
    risks.push({
      id: "visibility-caution",
      severity: "caution",
      token: metar.visibility?.raw ?? findToken(metar, /SM$|^\d{4}$|CAVOK/),
      message: `Widzialność jest używalna, ale pozostaje w strefie ostrożności dla profilu ${profile.pl}.`,
      skillTag: "visibility",
    });
  }

  if (ceiling < minima.minimumCeilingFt) {
    risks.push({
      id: "ceiling-minimum",
      severity: "danger",
      token: findToken(metar, /^(BKN|OVC|VV)\d{3}/),
      message: `Podstawa ${ceiling} ft jest poniżej minimum profilu ${profile.pl} (${minima.minimumCeilingFt} ft).`,
      skillTag: "clouds",
    });
  } else if (ceiling < minima.cautionCeilingFt) {
    risks.push({
      id: "ceiling-caution",
      severity: "caution",
      token: findToken(metar, /^(BKN|OVC|VV)\d{3}/),
      message: `Podstawa ${ceiling} ft jest marginalna dla tego profilu.`,
      skillTag: "clouds",
    });
  }

  if (metar.wind && metar.wind.speedKt > minima.maxWindKt) {
    risks.push({
      id: "wind-speed",
      severity: "danger",
      token: findToken(metar, /KT$/),
      message: `Wiatr ${metar.wind.speedKt} kt przekracza limit profilu (${minima.maxWindKt} kt).`,
      skillTag: "wind",
    });
  } else if (gustSpread > minima.maxGustSpreadKt) {
    risks.push({
      id: "gust-spread",
      severity: "caution",
      token: findToken(metar, /G\d{2,3}KT$/),
      message: `Różnica porywów ${gustSpread} kt wymaga dodatkowego marginesu pilotażowego.`,
      skillTag: "wind",
    });
  }

  if (weatherHit) {
    risks.push({
      id: "forbidden-weather",
      severity: weatherHit.includes("TS") || weatherHit.includes("FZ") || weatherHit.startsWith("+") ? "danger" : "caution",
      token: weatherHit,
      message: `${weatherHit} jest istotnym zagrożeniem dla profilu ${profile.pl}.`,
      skillTag: "weather",
    });
  }

  if (metar.runwayVisualRange.length) {
    risks.push({
      id: "rvr",
      severity: "caution",
      token: metar.runwayVisualRange[0].raw,
      message: "Raport zawiera RVR — trzeba osobno omówić widzialność na pasie.",
      skillTag: "visibility",
    });
  }

  if (metar.trend?.some((token) => token === "TEMPO" || token === "BECMG" || token.startsWith("PROB"))) {
    risks.push({
      id: "trend",
      severity: "caution",
      token: metar.trend[0],
      message: "Grupa trendu sugeruje, że pogoda może zmienić się w oknie misji.",
      skillTag: "taf",
    });
  }

  if (!risks.length) {
    risks.push({
      id: "vfr-baseline",
      severity: "info",
      token: metar.flightCategory ?? "VFR",
      message: "Brak blokady dla profilu — wykonaj standardowy skan wiatru, widzialności, podstawy i trendu.",
      skillTag: "scan",
    });
  }

  const expected = decisionFromRisks(risks);
  const primary = firstImportantRisk(risks);
  const whatWouldImprove = risks
    .filter((risk) => risk.severity !== "info")
    .slice(0, 3)
    .map((risk) => {
      if (risk.skillTag === "visibility") return `Widzialność powyżej ${minima.cautionVisibilitySm} SM przybliżyłaby decyzję do GO.`;
      if (risk.skillTag === "clouds") return `Podstawa powyżej ${minima.cautionCeilingFt} ft obniżyłaby ryzyko profilu.`;
      if (risk.skillTag === "wind") return `Niższy wiatr stały albo różnica porywów poniżej ${minima.maxGustSpreadKt} kt zmniejszyłaby ryzyko pilotażowe.`;
      if (risk.skillTag === "weather") return `Brak ${risk.token} w raporcie zmniejszyłby zagrożenie operacyjne.`;
      return `Sprawdź ponownie ${risk.token}, zanim zmienisz decyzję.`;
    });

  return {
    profile: profileId,
    expected,
    match: decision ? decision === expected : false,
    score: decision ? (decision === expected ? 100 : expected === "CAUTION" || decision === "CAUTION" ? 65 : 35) : 0,
    primaryRisk: primary?.message ?? "Nie wykryto istotnego ryzyka.",
    keyToken: primary?.token ?? metar.flightCategory ?? "METAR",
    risks,
    trainingFocus: primary?.skillTag ?? "scan",
    whatWouldImprove: whatWouldImprove.length ? whatWouldImprove : ["Przed odlotem nadal monitoruj TAF i pobliskie lotniska zapasowe."],
  };
}
