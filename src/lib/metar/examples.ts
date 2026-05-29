import type { MetarExample } from "@/types/metar";
import { parseMetar } from "./parser";

const EXAMPLES: Array<Omit<MetarExample, "parsed">> = [
  {
    id: "ksfo-vfr",
    title: "Dzienne VFR nad wybrzeżem",
    rawText: "KSFO 201856Z 28014KT 10SM FEW015 17/10 A3008 RMK AO2",
    explanation: "Wyraźny wiatr z zachodu, dobra widzialność i tylko nieliczne chmury — dobry przykład VFR.",
  },
  {
    id: "ksea-mvfr",
    title: "Warstwa morska MVFR",
    rawText: "KSEA 201853Z 21008KT 5SM BKN020 13/11 A2996 RMK AO2",
    explanation: "Warstwa BKN na 2 000 ft tworzy podstawę chmur i obniża kategorię do MVFR.",
  },
  {
    id: "kjfk-ifr-tsra",
    title: "IFR z burzą i deszczem",
    rawText: "KJFK 121651Z 18012G22KT 150V220 1 1/2SM R04R/1200FT/D TSRA BR BKN008CB 18/16 A2992 TEMPO RMK AO2",
    explanation: "Niska podstawa cumulonimbus, ograniczona widzialność, porywy, RVR, burza z deszczem i zamglenie tworzą sytuację IFR.",
  },
  {
    id: "eppo-cavok",
    title: "Spokojne CAVOK",
    rawText: "EPPO 281200Z 00000KT CAVOK 20/10 Q1013 NOSIG",
    explanation: "Cisza i CAVOK oznaczają dobrą widzialność oraz brak istotnych chmur i zjawisk pogody.",
  },
];

export const metarExamples: MetarExample[] = EXAMPLES.map((example) => ({
  ...example,
  parsed: parseMetar(example.rawText),
}));
