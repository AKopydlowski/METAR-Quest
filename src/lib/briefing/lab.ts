import type { ParsedMetar } from "@/types/metar";
import { assessWeatherDecision, type DecisionAssessment } from "@/lib/decision/decisionEngine";
import { PILOT_PROFILES, type MissionProfile, type PilotDecision } from "@/lib/decision/profiles";
import { parseMetar } from "@/lib/metar/parser";

export type CrosswindAssessment = {
  runwayHeading: number;
  windDirection: number | null;
  windSpeedKt: number;
  gustKt?: number;
  headwindKt: number;
  crosswindKt: number;
  gustCrosswindKt?: number;
  component: "headwind" | "tailwind" | "calm-variable";
  limitKt: number;
  status: PilotDecision;
  explanation: string;
};

export type BriefingLeg = {
  role: "departure" | "destination" | "alternate";
  station: string;
  metar: ParsedMetar;
  assessment: DecisionAssessment;
};

export type InstructorBriefing = {
  overallDecision: PilotDecision;
  headline: string;
  scanOrder: string[];
  missedItems: string[];
  nextActions: string[];
};

export type HistoricalWeatherScenario = {
  id: string;
  title: string;
  region: string;
  difficulty: "starter" | "pro" | "checkride";
  briefingGoal: string;
  teachingPoint: string;
  route: string;
  timeline: Array<{ time: string; raw: string; expected: PilotDecision }>;
};

export type CertificationTrack = {
  id: string;
  title: string;
  level: "bronze" | "silver" | "gold" | "black";
  requirements: string[];
  unlocks: string;
};

const DECISION_WEIGHT: Record<PilotDecision, number> = { GO: 1, CAUTION: 2, "NO-GO": 3 };

export function normalizeRunwayHeading(runway: string): number | null {
  const match = runway.trim().toUpperCase().match(/^(?:RWY\s*)?(\d{1,2})([LCR])?$/);
  if (!match) return null;
  const number = Number(match[1]);
  if (number < 1 || number > 36) return null;
  return number === 36 ? 360 : number * 10;
}

function angularDifference(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function signedHeadwind(windDirection: number, runwayHeading: number, speed: number): number {
  const radians = (angularDifference(windDirection, runwayHeading) * Math.PI) / 180;
  return Math.round(Math.cos(radians) * speed);
}

function crosswind(windDirection: number, runwayHeading: number, speed: number): number {
  const radians = (angularDifference(windDirection, runwayHeading) * Math.PI) / 180;
  return Math.round(Math.abs(Math.sin(radians) * speed));
}

export function calculateCrosswindAssessment(metar: ParsedMetar, runway: string, profileId: MissionProfile): CrosswindAssessment | null {
  const runwayHeading = normalizeRunwayHeading(runway);
  if (!runwayHeading || !metar.wind) return null;

  const profile = PILOT_PROFILES[profileId];
  const limitKt = Math.max(8, Math.round(profile.minima.maxWindKt * 0.55));

  if (metar.wind.direction === null || metar.wind.speedKt === 0) {
    return {
      runwayHeading,
      windDirection: metar.wind.direction,
      windSpeedKt: metar.wind.speedKt,
      gustKt: metar.wind.gustKt,
      headwindKt: 0,
      crosswindKt: 0,
      gustCrosswindKt: undefined,
      component: "calm-variable",
      limitKt,
      status: metar.wind.gustKt && metar.wind.gustKt > profile.minima.maxWindKt ? "CAUTION" : "GO",
      explanation: "Wind is calm or variable, so runway-specific components need local tower/ATIS confirmation.",
    };
  }

  const headwindKt = signedHeadwind(metar.wind.direction, runwayHeading, metar.wind.speedKt);
  const crosswindKt = crosswind(metar.wind.direction, runwayHeading, metar.wind.speedKt);
  const gustCrosswindKt = metar.wind.gustKt ? crosswind(metar.wind.direction, runwayHeading, metar.wind.gustKt) : undefined;
  const worstCrosswind = Math.max(crosswindKt, gustCrosswindKt ?? 0);
  const component = headwindKt < -2 ? "tailwind" : "headwind";
  const status: PilotDecision = component === "tailwind" || worstCrosswind > limitKt + 5 ? "NO-GO" : worstCrosswind > limitKt ? "CAUTION" : "GO";

  return {
    runwayHeading,
    windDirection: metar.wind.direction,
    windSpeedKt: metar.wind.speedKt,
    gustKt: metar.wind.gustKt,
    headwindKt,
    crosswindKt,
    gustCrosswindKt,
    component,
    limitKt,
    status,
    explanation:
      status === "GO"
        ? "Runway component is inside the profile training limit; keep monitoring gusts and runway changes."
        : status === "CAUTION"
          ? "Crosswind is above the comfort band; brief technique, instructor limits and alternate runway options."
          : "Tailwind or excessive crosswind makes this a stop/go decision for the selected profile.",
  };
}

export function pickOverallDecision(decisions: PilotDecision[]): PilotDecision {
  return decisions.reduce<PilotDecision>((worst, item) => (DECISION_WEIGHT[item] > DECISION_WEIGHT[worst] ? item : worst), "GO");
}

export function buildInstructorBriefing(legs: BriefingLeg[], crosswindAssessment?: CrosswindAssessment | null): InstructorBriefing {
  const riskDecisions = legs.map((leg) => leg.assessment.expected);
  if (crosswindAssessment) riskDecisions.push(crosswindAssessment.status);
  const overallDecision = pickOverallDecision(riskDecisions);
  const riskLegs = legs.filter((leg) => leg.assessment.expected !== "GO");
  const primary = riskLegs[0] ?? legs[0];
  const crosswindLine = crosswindAssessment
    ? `Runway ${crosswindAssessment.runwayHeading.toString().padStart(3, "0")}°: ${crosswindAssessment.crosswindKt} kt crosswind${crosswindAssessment.gustCrosswindKt ? `, ${crosswindAssessment.gustCrosswindKt} kt in gusts` : ""}.`
    : "Runway component not calculated yet.";

  return {
    overallDecision,
    headline:
      overallDecision === "GO"
        ? "Instructor scan: no stopper detected, but complete the normal wind–visibility–ceiling–trend check."
        : `Instructor scan: ${primary.role} ${primary.station} drives a ${overallDecision} because of ${primary.assessment.primaryRisk}`,
    scanOrder: [
      "1. Start with report age, station and flight category before reading isolated tokens.",
      "2. Compare visibility and ceiling against the selected pilot profile minima.",
      "3. Brief wind, gust spread and runway component before committing to launch.",
      "4. Read TAF trend/TEMPO/PROB groups across the mission window, not just the current METAR.",
      "5. Verify alternate weather is genuinely better than the destination risk.",
    ],
    missedItems: [
      ...riskLegs.slice(0, 3).map((leg) => `${leg.role} ${leg.station}: ${leg.assessment.keyToken} — ${leg.assessment.primaryRisk}`),
      crosswindLine,
    ],
    nextActions:
      overallDecision === "NO-GO"
        ? ["Delay, choose a better alternate, or switch to an instructor/IFR-approved plan.", "Re-run the briefing after the next METAR/TAF update."]
        : overallDecision === "CAUTION"
          ? ["Set personal minimum triggers before taxi.", "Prepare diversion gates and compare a second alternate."]
          : ["Keep monitoring trend groups and runway changes.", "Use the mission as a spaced-review repetition for the weakest token."],
  };
}

export function buildBriefingLeg(role: BriefingLeg["role"], metar: ParsedMetar, profile: MissionProfile): BriefingLeg {
  return {
    role,
    station: metar.station,
    metar,
    assessment: assessWeatherDecision(profile, metar),
  };
}

export const historicalWeatherScenarios: HistoricalWeatherScenario[] = [
  {
    id: "marine-layer-lift",
    title: "Marine layer that almost lifts",
    region: "Pacific coast",
    difficulty: "starter",
    route: "KSFO → KOAK",
    briefingGoal: "Decide whether a student VFR local flight can launch before the ceiling improves.",
    teachingPoint: "MVFR ceilings can look tempting, but student minima should drive the call until the trend is confirmed.",
    timeline: [
      { time: "16:56Z", raw: "KSFO 201656Z 27010KT 5SM BKN018 14/11 A3005", expected: "NO-GO" },
      { time: "17:56Z", raw: "KSFO 201756Z 28012KT 7SM BKN025 15/11 A3006", expected: "CAUTION" },
      { time: "18:56Z", raw: "KSFO 201856Z 28014KT 10SM FEW015 17/10 A3008", expected: "GO" },
    ],
  },
  {
    id: "tempo-thunder",
    title: "TEMPO thunderstorm trap",
    region: "Northeast US",
    difficulty: "pro",
    route: "KJFK → KPHL",
    briefingGoal: "Catch the convective risk before accepting a current VFR gap.",
    teachingPoint: "A current report can be flyable while the mission window is dominated by TSRA/TEMPO risk.",
    timeline: [
      { time: "15:51Z", raw: "KJFK 121551Z 17010KT 6SM SCT025 BKN050 19/16 A2994", expected: "CAUTION" },
      { time: "16:51Z", raw: "KJFK 121651Z 18012G22KT 150V220 1 1/2SM R04R/1200FT/D TSRA BR BKN008CB 18/16 A2992 TEMPO RMK AO2", expected: "NO-GO" },
      { time: "17:51Z", raw: "KJFK 121751Z 22018G30KT 3SM +RA BR BKN012 17/16 A2990", expected: "NO-GO" },
    ],
  },
  {
    id: "night-br",
    title: "Night visibility erosion",
    region: "Central Europe",
    difficulty: "checkride",
    route: "EPWA → EPKK alternate EPPO",
    briefingGoal: "Protect night VFR minima when mist starts reducing visual references.",
    teachingPoint: "BR at night is not a cosmetic token; it can move a VFR trip into a conservative CAUTION/NO-GO plan.",
    timeline: [
      { time: "19:00Z", raw: "EPWA 281900Z 09006KT 8000 NSC 12/10 Q1018 NOSIG", expected: "CAUTION" },
      { time: "20:00Z", raw: "EPWA 282000Z 08005KT 5000 BR SCT012 11/10 Q1018", expected: "NO-GO" },
      { time: "21:00Z", raw: "EPWA 282100Z 07004KT 3000 BR BKN009 10/10 Q1017", expected: "NO-GO" },
    ],
  },
];

export const certificationTracks: CertificationTrack[] = [
  {
    id: "metar-basics",
    title: "METAR Basics Certificate",
    level: "bronze",
    requirements: ["90% on station/time, wind, visibility and QNH drills", "Decode 10 raw METAR reports without hints", "Explain one CAVOK and one RVR example"],
    unlocks: "Daily briefing streaks and bronze share card",
  },
  {
    id: "taf-mission",
    title: "TAF Mission Planner",
    level: "silver",
    requirements: ["Correctly classify TEMPO, BECMG, FM and PROB groups", "Complete 5 mission-window TAF timelines", "Identify the highest-risk segment before launch"],
    unlocks: "Replay weather scenarios and silver timeline badge",
  },
  {
    id: "vfr-decision",
    title: "VFR Weather Decision Checkride",
    level: "gold",
    requirements: ["Pass a 20-question no-hints checkride at 85%", "Make 5 consecutive correct GO/CAUTION/NO-GO calls", "Brief departure, destination and alternate risks"],
    unlocks: "Gold checkride report and instructor debrief mode",
  },
  {
    id: "briefing-captain",
    title: "Briefing Captain",
    level: "black",
    requirements: ["Complete all historical replay scenarios", "Keep spaced-review mastery above 80%", "Submit a full route briefing with runway component"],
    unlocks: "Black-level profile, advanced missions and classroom-ready export",
  },
];

export function parseScenarioMetar(raw: string): ParsedMetar {
  return parseMetar(raw);
}
