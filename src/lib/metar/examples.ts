import type { MetarExample } from "@/types/metar";
import { parseMetar } from "./parser";

const EXAMPLES: Array<Omit<MetarExample, "parsed">> = [
  {
    id: "ksfo-vfr",
    title: "Daytime coastal VFR",
    rawText: "KSFO 201856Z 28014KT 10SM FEW015 17/10 A3008 RMK AO2",
    explanation: "Strong westerly wind, good visibility, and only few clouds.",
  },
  {
    id: "ksea-mvfr",
    title: "MVFR marine layer",
    rawText: "KSEA 201853Z 21008KT 5SM BKN020 13/11 A2996 RMK AO2",
    explanation: "Broken ceiling at 2,000 ft pushes conditions into MVFR.",
  },
  {
    id: "kjfk-ifr-tsra",
    title: "IFR thunderstorm and rain",
    rawText: "KJFK 121651Z 18012G22KT 150V220 1 1/2SM R04R/1200FT/D TSRA BR BKN008CB 18/16 A2992 TEMPO RMK AO2",
    explanation: "Low broken cumulonimbus, restricted visibility, gusts, RVR, thunderstorm rain, and mist create IFR conditions.",
  },
  {
    id: "eppo-cavok",
    title: "Calm CAVOK",
    rawText: "EPPO 281200Z 00000KT CAVOK 20/10 Q1013 NOSIG",
    explanation: "Calm wind and CAVOK indicate good visibility and no operationally significant cloud or weather.",
  },
];

export const metarExamples: MetarExample[] = EXAMPLES.map((example) => ({
  ...example,
  parsed: parseMetar(example.rawText),
}));
