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
];

export const metarExamples: MetarExample[] = EXAMPLES.map((example) => ({
  ...example,
  parsed: parseMetar(example.rawText),
}));
