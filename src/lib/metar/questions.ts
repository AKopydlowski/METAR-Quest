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

export function buildQuestionBank(): QuizQuestion[] {
  const bank: QuizQuestion[] = [];

  for (const example of metarExamples) {
    const metar = example.parsed;

    bank.push({
      id: `q-${example.id}-category`,
      prompt: `Based on the METAR below, what is the flight category at ${metar.station}?`,
      metar,
      metarRaw: example.rawText,
      difficulty: "easy",
      skillTag: "clouds",
      choices: buildChoices(metar.flightCategory ?? "VFR", ["MVFR", "IFR", "LIFR"]),
    });

    bank.push({
      id: `q-${example.id}-wind`,
      prompt: `From this METAR, what wind speed is reported for ${metar.station}?`,
      metar,
      metarRaw: example.rawText,
      difficulty: "easy",
      skillTag: "wind",
      choices: buildChoices(`${metar.wind.speedKt} KT`, [`${Math.max(metar.wind.speedKt - 4, 0)} KT`, `${metar.wind.speedKt + 6} KT`, "Calm"],),
    });

    bank.push({
      id: `q-${example.id}-vis`,
      prompt: `Looking only at the METAR below, what visibility is reported at ${metar.station}?`,
      metar,
      metarRaw: example.rawText,
      difficulty: "medium",
      skillTag: "visibility",
      choices: buildChoices(`${metar.visibility.statuteMiles} SM`, ["1 SM", "3 SM", "10+ SM"]),
    });

    bank.push({
      id: `q-${example.id}-ceiling`,
      prompt: "What cloud/ceiling interpretation best matches this exact METAR string?",
      metar,
      metarRaw: example.rawText,
      difficulty: "medium",
      skillTag: "clouds",
      choices: buildChoices(ceilingFromClouds(example.rawText), ["Scattered only (no ceiling)", "Clear sky", "Thunderstorm ceiling"]),
    });

    bank.push({
      id: `q-${example.id}-tempdew`,
      prompt: `In this METAR, which temperature/dewpoint pair for ${metar.station} is correct?`,
      metar,
      metarRaw: example.rawText,
      difficulty: "hard",
      skillTag: "temperature",
      choices: buildChoices(`${metar.temperature.celsius}/${metar.temperature.dewpointCelsius}°C`, [`${metar.temperature.dewpointCelsius}/${metar.temperature.celsius}°C`, `${metar.temperature.celsius + 3}/${metar.temperature.dewpointCelsius}°C`, `${metar.temperature.celsius}/${metar.temperature.dewpointCelsius - 4}°C`]),
    });
  }

  return bank;
}
