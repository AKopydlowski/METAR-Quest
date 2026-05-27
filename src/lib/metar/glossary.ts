export interface GlossaryEntry {
  term: string;
  definition: string;
}

export const metarGlossary: GlossaryEntry[] = [
  { term: "METAR", definition: "Routine aviation weather observation report." },
  { term: "TAF", definition: "Terminal Aerodrome Forecast for a specific airport." },
  { term: "BKN", definition: "Broken cloud coverage; counts as a ceiling." },
  { term: "OVC", definition: "Overcast cloud coverage; counts as a ceiling." },
  { term: "RMK", definition: "Remarks section containing supplemental details." },
];
