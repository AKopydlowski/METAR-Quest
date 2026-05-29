export type MissionProfile = "student-vfr" | "ppl-vfr" | "ifr-brief" | "night-cross-country";
export type PilotDecision = "GO" | "CAUTION" | "NO-GO";

export type DecisionMinima = {
  minimumVisibilitySm: number;
  minimumCeilingFt: number;
  cautionVisibilitySm: number;
  cautionCeilingFt: number;
  maxGustSpreadKt: number;
  maxWindKt: number;
  forbiddenWeather: string[];
};

export type PilotProfileDefinition = {
  id: MissionProfile;
  label: string;
  en: string;
  pl: string;
  persona: string;
  minima: DecisionMinima;
};

export const PILOT_PROFILES: Record<MissionProfile, PilotProfileDefinition> = {
  "student-vfr": {
    id: "student-vfr",
    label: "Uczeń VFR solo",
    en: "Student VFR solo: conservative decision-making, avoid marginal or instrument weather.",
    pl: "Uczeń VFR solo: decyzja konserwatywna, unikaj pogody marginalnej i instrumentalnej.",
    persona: "uczeń pilot",
    minima: {
      minimumVisibilitySm: 5,
      minimumCeilingFt: 2500,
      cautionVisibilitySm: 7,
      cautionCeilingFt: 3500,
      maxGustSpreadKt: 10,
      maxWindKt: 20,
      forbiddenWeather: ["TS", "FG", "FZ", "+RA", "SN", "SQ"],
    },
  },
  "ppl-vfr": {
    id: "ppl-vfr",
    label: "PPL VFR — trasa",
    en: "PPL VFR cross-country: accept good VFR, flag marginal visibility, ceiling, gusts and convective weather.",
    pl: "PPL VFR trasa: akceptuj dobrą VFR, oznacz marginalną widzialność, podstawę, porywy i konwekcję.",
    persona: "pilot VFR",
    minima: {
      minimumVisibilitySm: 3,
      minimumCeilingFt: 1500,
      cautionVisibilitySm: 6,
      cautionCeilingFt: 3000,
      maxGustSpreadKt: 15,
      maxWindKt: 28,
      forbiddenWeather: ["TS", "FZ", "+RA", "SQ"],
    },
  },
  "ifr-brief": {
    id: "ifr-brief",
    label: "Briefing IFR",
    en: "IFR briefing: identify operational threats before the approach briefing.",
    pl: "Briefing IFR: rozpoznaj zagrożenia operacyjne przed podejściem.",
    persona: "uczeń IFR",
    minima: {
      minimumVisibilitySm: 1,
      minimumCeilingFt: 500,
      cautionVisibilitySm: 3,
      cautionCeilingFt: 1000,
      maxGustSpreadKt: 20,
      maxWindKt: 35,
      forbiddenWeather: ["+TS", "FZRA", "+SN", "SQ"],
    },
  },
  "night-cross-country": {
    id: "night-cross-country",
    label: "Nocna trasa",
    en: "Night cross-country: raise the bar for visibility, ceiling and gusts.",
    pl: "Nocna trasa: podnieś wymagania wobec widzialności, podstawy i porywów.",
    persona: "pilot nocny VFR",
    minima: {
      minimumVisibilitySm: 6,
      minimumCeilingFt: 3000,
      cautionVisibilitySm: 8,
      cautionCeilingFt: 4500,
      maxGustSpreadKt: 10,
      maxWindKt: 22,
      forbiddenWeather: ["TS", "FG", "FZ", "+RA", "SN", "BR"],
    },
  },
};

export const PROFILE_IDS = Object.keys(PILOT_PROFILES) as MissionProfile[];
