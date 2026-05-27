export interface GlossaryEntry {
  term: string;
  definition: string;
}

export const metarGlossary: GlossaryEntry[] = [
  { term: "METAR", definition: "Routine aviation weather observation report." },
  { term: "TAF", definition: "Terminal Aerodrome Forecast for a specific airport." },
  { term: "AUTO", definition: "Automated weather report without direct human augmentation." },
  { term: "RMK", definition: "Remarks section containing supplemental details." },
  { term: "KT", definition: "Knots, the wind speed unit used in METAR/TAF." },
  { term: "SM", definition: "Statute miles, used in US visibility reporting." },
  { term: "CLR", definition: "Clear below 12,000 ft (automated station code)." },
  { term: "SKC", definition: "Sky clear (manual observation)." },
  { term: "FEW", definition: "Few clouds: 1/8 to 2/8 sky coverage." },
  { term: "SCT", definition: "Scattered clouds: 3/8 to 4/8 sky coverage." },
  { term: "BKN", definition: "Broken clouds: 5/8 to 7/8 sky coverage; counts as a ceiling." },
  { term: "OVC", definition: "Overcast: 8/8 sky coverage; counts as a ceiling." },
  { term: "VV", definition: "Vertical visibility when sky is obscured (e.g., fog)." },
  { term: "CAVOK", definition: "Ceiling and Visibility OK (used outside US in many reports)." },
  { term: "BR", definition: "Mist." },
  { term: "FG", definition: "Fog." },
  { term: "RA", definition: "Rain." },
  { term: "SN", definition: "Snow." },
  { term: "TS", definition: "Thunderstorm." },
  { term: "DZ", definition: "Drizzle." },
  { term: "HZ", definition: "Haze." },
  { term: "A2992", definition: "Altimeter setting in inches of mercury (example: 29.92 inHg)." },
  { term: "Q1013", definition: "Altimeter setting in hPa (common outside US)." },
  { term: "M05", definition: "Minus temperature/dewpoint value (example: -5°C)." },
  { term: "VRB", definition: "Variable wind direction." },
  { term: "G25KT", definition: "Wind gusting to 25 knots." },
  { term: "VFR", definition: "Visual Flight Rules weather category." },
  { term: "MVFR", definition: "Marginal VFR weather category." },
  { term: "IFR", definition: "Instrument Flight Rules weather category." },
  { term: "LIFR", definition: "Low Instrument Flight Rules weather category." },
];
