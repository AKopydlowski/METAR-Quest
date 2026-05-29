export type LearnModule = {
  id: string;
  title: string;
  skill: string;
  goal: string;
  level: "starter" | "builder" | "mission";
};

export const learnModules: LearnModule[] = [
  { id: "station-time", title: "Station + time", skill: "scan", level: "starter", goal: "Find the ICAO identifier and UTC observation timestamp before reading risk." },
  { id: "wind", title: "Wind", skill: "wind", level: "starter", goal: "Read direction, steady speed, variable sector and gust spread." },
  { id: "visibility", title: "Visibility", skill: "visibility", level: "builder", goal: "Convert meters, statute miles, CAVOK and RVR into operational visibility." },
  { id: "clouds", title: "Ceiling/clouds", skill: "clouds", level: "builder", goal: "Identify BKN/OVC/VV ceilings and convective cloud flags." },
  { id: "weather", title: "Present weather", skill: "weather", level: "builder", goal: "Spot TS, FG, FZ, SN, RA and other mission-changing weather groups." },
  { id: "altimeter", title: "Altimeter/QNH", skill: "altimeter", level: "starter", goal: "Read Q and A groups correctly for cockpit setup." },
  { id: "taf", title: "TAF trends", skill: "weather", level: "mission", goal: "Use TEMPO, BECMG, FM and PROB groups to brief what can change next." },
  { id: "decision", title: "GO / CAUTION / NO-GO", skill: "clouds", level: "mission", goal: "Turn METAR/TAF tokens, alternates and pilot profile minima into a conservative decision." },
];
