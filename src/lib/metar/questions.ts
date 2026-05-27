import type { ParsedMetar } from "@/types/metar";
import type { QuizChoice, QuizQuestion } from "@/types/quiz";
import { metarExamples } from "./examples";

function buildChoices(correct: string, incorrect: string[]): QuizChoice[] {
  const deduped = [correct, ...incorrect].filter((label, index, arr) => arr.indexOf(label) === index);
  return deduped.slice(0, 4).map((label) => ({
    id: `c-${correct}-${label}`,
    label,
    isCorrect: label === correct,
  }));
}

function ceilingFromClouds(rawText: string): string {
  if (rawText.includes("OVC")) return "Overcast ceiling";
  if (rawText.includes("BKN")) return "Broken ceiling";
  if (rawText.includes("VV")) return "Vertical visibility (obscured sky)";
  return "No significant ceiling";
}

function buildQuestionsFromMetar(idPrefix: string, metarRaw: string, metar: ParsedMetar): QuizQuestion[] {
  return [
    {
      id: `q-${idPrefix}-category`,
      prompt: `Based on the METAR below, what is the flight category at ${metar.station}?`,
      metar,
      metarRaw,
      difficulty: "easy",
      skillTag: "clouds",
      choices: buildChoices(metar.flightCategory ?? "VFR", ["MVFR", "IFR", "LIFR"]),
    },
    {
      id: `q-${idPrefix}-wind`,
      prompt: `From this METAR, what wind speed is reported for ${metar.station}?`,
      metar,
      metarRaw,
      difficulty: "easy",
      skillTag: "wind",
      choices: buildChoices(`${metar.wind.speedKt} KT`, [`${Math.max(metar.wind.speedKt - 4, 0)} KT`, `${metar.wind.speedKt + 6} KT`, "Calm"]),
    },
    {
      id: `q-${idPrefix}-vis`,
      prompt: `Looking only at the METAR below, what visibility is reported at ${metar.station}?`,
      metar,
      metarRaw,
      difficulty: "medium",
      skillTag: "visibility",
      choices: buildChoices(`${metar.visibility.statuteMiles} SM`, ["1 SM", "3 SM", "10+ SM"]),
    },
    {
      id: `q-${idPrefix}-ceiling`,
      prompt: "What cloud/ceiling interpretation best matches this exact METAR string?",
      metar,
      metarRaw,
      difficulty: "medium",
      skillTag: "clouds",
      choices: buildChoices(ceilingFromClouds(metarRaw), ["Scattered only (no ceiling)", "Clear sky", "Thunderstorm ceiling"]),
    },
    {
      id: `q-${idPrefix}-tempdew`,
      prompt: `In this METAR, which temperature/dewpoint pair for ${metar.station} is correct?`,
      metar,
      metarRaw,
      difficulty: "hard",
      skillTag: "temperature",
      choices: buildChoices(`${metar.temperature.celsius}/${metar.temperature.dewpointCelsius}°C`, [`${metar.temperature.dewpointCelsius}/${metar.temperature.celsius}°C`, `${metar.temperature.celsius + 3}/${metar.temperature.dewpointCelsius}°C`, `${metar.temperature.celsius}/${metar.temperature.dewpointCelsius - 4}°C`]),
    },
  ];
}

export function buildQuestionBank(): QuizQuestion[] {
  return metarExamples.flatMap((example) => buildQuestionsFromMetar(example.id, example.rawText, example.parsed));
}

export function buildDynamicQuestionBank(entries: Array<{ id: string; rawText: string; metar: ParsedMetar }>): QuizQuestion[] {
  return entries.flatMap((entry) => buildQuestionsFromMetar(entry.id, entry.rawText, entry.metar));
}
