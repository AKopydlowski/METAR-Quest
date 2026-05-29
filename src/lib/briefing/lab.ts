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
  difficulty: "podstawy" | "pro" | "sprawdzenie";
  briefingGoal: string;
  teachingPoint: string;
  route: string;
  timeline: Array<{ time: string; raw: string; expected: PilotDecision }>;
};

export type CertificationTrack = {
  id: string;
  title: string;
  level: "brąz" | "srebro" | "złoto" | "czarny";
  requirements: string[];
  unlocks: string;
};

const DECISION_WEIGHT: Record<PilotDecision, number> = { GO: 1, CAUTION: 2, "NO-GO": 3 };
const ROLE_LABELS: Record<BriefingLeg["role"], string> = { departure: "odlot", destination: "cel", alternate: "zapasowe" };

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
      explanation: "Wiatr jest spokojny albo zmienny — składowe dla pasa trzeba potwierdzić lokalnie przez TWR/ATIS.",
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
        ? "Składowa wiatru mieści się w limicie profilu; nadal monitoruj porywy i zmianę pasa."
        : status === "CAUTION"
          ? "Wiatr boczny przekracza komfortowy zakres; omów technikę, limity instruktora i alternatywne pasy."
          : "Tylny wiatr albo zbyt duży wiatr boczny blokuje decyzję dla wybranego profilu.",
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
    ? `Pas ${crosswindAssessment.runwayHeading.toString().padStart(3, "0")}°: ${crosswindAssessment.crosswindKt} kt wiatru bocznego${crosswindAssessment.gustCrosswindKt ? `, ${crosswindAssessment.gustCrosswindKt} kt w porywach` : ""}.`
    : "Składowa pasa nie została jeszcze obliczona.";

  return {
    overallDecision,
    headline:
      overallDecision === "GO"
        ? "Skan instruktora: brak blokady, ale wykonaj pełne sprawdzenie wiatru, widzialności, podstawy i trendu."
        : `Skan instruktora: odcinek ${ROLE_LABELS[primary.role]} ${primary.station} prowadzi do decyzji ${overallDecision}, ponieważ: ${primary.assessment.primaryRisk}`,
    scanOrder: [
      "1. Zacznij od wieku raportu, stacji i kategorii lotu, zanim wejdziesz w pojedyncze tokeny.",
      "2. Porównaj widzialność i podstawę z minimami wybranego profilu pilota.",
      "3. Omów wiatr, różnicę porywów i składową pasa przed decyzją o odlocie.",
      "4. Czytaj trendy TAF/TEMPO/PROB w całym oknie misji, nie tylko bieżący METAR.",
      "5. Sprawdź, czy lotnisko zapasowe naprawdę ma niższe ryzyko niż docelowe.",
    ],
    missedItems: [
      ...riskLegs.slice(0, 3).map((leg) => `${ROLE_LABELS[leg.role]} ${leg.station}: ${leg.assessment.keyToken} — ${leg.assessment.primaryRisk}`),
      crosswindLine,
    ],
    nextActions:
      overallDecision === "NO-GO"
        ? ["Opóźnij lot, wybierz lepsze zapasowe albo przejdź na plan zatwierdzony przez instruktora/IFR.", "Powtórz briefing po kolejnej aktualizacji METAR/TAF."]
        : overallDecision === "CAUTION"
          ? ["Ustal osobiste minima i warunki przerwania przed kołowaniem.", "Przygotuj punkty decyzji o zmianie trasy i porównaj drugie lotnisko zapasowe."]
          : ["Monitoruj grupy trendu i ewentualne zmiany pasa.", "Potraktuj misję jako powtórkę rozłożoną w czasie dla najsłabszego tokenu."],
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
    title: "Warstwa morska, która prawie się podnosi",
    region: "Wybrzeże Pacyfiku",
    difficulty: "podstawy",
    route: "KSFO → KOAK",
    briefingGoal: "Zdecyduj, czy uczeń VFR może wystartować lokalnie, zanim poprawi się podstawa.",
    teachingPoint: "Podstawy MVFR mogą wyglądać kusząco, ale do potwierdzenia trendu decydują minima ucznia.",
    timeline: [
      { time: "16:56Z", raw: "KSFO 201656Z 27010KT 5SM BKN018 14/11 A3005", expected: "NO-GO" },
      { time: "17:56Z", raw: "KSFO 201756Z 28012KT 7SM BKN025 15/11 A3006", expected: "CAUTION" },
      { time: "18:56Z", raw: "KSFO 201856Z 28014KT 10SM FEW015 17/10 A3008", expected: "GO" },
    ],
  },
  {
    id: "tempo-thunder",
    title: "Pułapka burzowa TEMPO",
    region: "Północny wschód USA",
    difficulty: "pro",
    route: "KJFK → KPHL",
    briefingGoal: "Wychwyć ryzyko konwekcyjne, zanim zaakceptujesz chwilowe okno VFR.",
    teachingPoint: "Bieżący raport może wyglądać lotnie, gdy całe okno misji dominuje ryzyko TSRA/TEMPO.",
    timeline: [
      { time: "15:51Z", raw: "KJFK 121551Z 17010KT 6SM SCT025 BKN050 19/16 A2994", expected: "CAUTION" },
      { time: "16:51Z", raw: "KJFK 121651Z 18012G22KT 150V220 1 1/2SM R04R/1200FT/D TSRA BR BKN008CB 18/16 A2992 TEMPO RMK AO2", expected: "NO-GO" },
      { time: "17:51Z", raw: "KJFK 121751Z 22018G30KT 3SM +RA BR BKN012 17/16 A2990", expected: "NO-GO" },
    ],
  },
  {
    id: "night-br",
    title: "Nocne pogarszanie widzialności",
    region: "Europa Środkowa",
    difficulty: "sprawdzenie",
    route: "EPWA → EPKK alternate EPPO",
    briefingGoal: "Chroń minima nocnego VFR, gdy zamglenie zaczyna ograniczać odniesienia wzrokowe.",
    teachingPoint: "BR nocą nie jest kosmetycznym tokenem; może przesunąć lot VFR do konserwatywnego planu CAUTION/NO-GO.",
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
    title: "Certyfikat podstaw METAR",
    level: "brąz",
    requirements: ["90% w ćwiczeniach stacji/czasu, wiatru, widzialności i QNH", "Rozkoduj 10 surowych raportów METAR bez podpowiedzi", "Wyjaśnij po jednym przykładzie CAVOK i RVR"],
    unlocks: "Serie codziennych briefingów i brązowa karta wyniku",
  },
  {
    id: "taf-mission",
    title: "Planer misji TAF",
    level: "srebro",
    requirements: ["Poprawnie klasyfikuj grupy TEMPO, BECMG, FM i PROB", "Ukończ 5 osi TAF dla okna misji", "Wskaż segment najwyższego ryzyka przed odlotem"],
    unlocks: "Scenariusze odtworzenia pogody i srebrna odznaka osi czasu",
  },
  {
    id: "vfr-decision",
    title: "Sprawdzenie decyzji pogodowych VFR",
    level: "złoto",
    requirements: ["Zdaj 20-pytaniowe sprawdzenie bez podpowiedzi na 85%", "Podejmij 5 poprawnych decyzji GO/CAUTION/NO-GO z rzędu", "Omów ryzyko odlotu, celu i lotniska zapasowego"],
    unlocks: "Złoty raport sprawdzenia i tryb omówienia instruktora",
  },
  {
    id: "briefing-captain",
    title: "Kapitan briefingu",
    level: "czarny",
    requirements: ["Ukończ wszystkie historyczne scenariusze odtworzeniowe", "Utrzymaj opanowanie powtórek powyżej 80%", "Przygotuj pełny briefing trasy ze składową pasa"],
    unlocks: "Profil czarnego poziomu, zaawansowane misje i eksport do użycia na zajęciach",
  },
];

export function parseScenarioMetar(raw: string): ParsedMetar {
  return parseMetar(raw);
}
