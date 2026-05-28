import type { ParsedMetar } from "@/types/metar";
import type { QuizChoice, QuizQuestion } from "@/types/quiz";
import { metarExamples } from "./examples";

function buildChoices(correct: string, incorrect: string[], rationales: Record<string, string> = {}): QuizChoice[] {
  const deduped = [correct, ...incorrect].filter((label, index, arr) => arr.indexOf(label) === index);
  return deduped.slice(0, 4).map((label) => ({
    id: `c-${correct}-${label}`,
    label,
    isCorrect: label === correct,
    rationale: rationales[label] ?? (label === correct ? "This answer matches the decoded METAR group." : "This option does not match the decoded METAR group."),
  }));
}

function ceilingFromClouds(rawText: string): string {
  if (rawText.includes("OVC")) return "Overcast ceiling";
  if (rawText.includes("BKN")) return "Broken ceiling";
  if (rawText.includes("VV")) return "Vertical visibility (obscured sky)";
  if (rawText.includes("CAVOK")) return "Ceiling and visibility OK";
  return "No significant ceiling";
}

function cloudSummary(metar: ParsedMetar): string {
  if (!metar.clouds.length) return "no reported ceiling-producing cloud layer";
  return metar.clouds.map((cloud) => `${cloud.coverage}${cloud.baseFtAgl ? ` at ${cloud.baseFtAgl} ft` : ""}${cloud.cloudType ? ` ${cloud.cloudType}` : ""}`).join(", ");
}

function maybeQuestion(question: QuizQuestion | false | undefined): QuizQuestion[] {
  return question ? [question] : [];
}

function buildQuestionsFromMetar(idPrefix: string, metarRaw: string, metar: ParsedMetar): QuizQuestion[] {
  return [
    ...maybeQuestion({
      id: `q-${idPrefix}-category`,
      prompt: `Based on the METAR below, what is the flight category at ${metar.station}?`,
      metar,
      metarRaw,
      difficulty: "easy",
      skillTag: "clouds",
      choices: buildChoices(metar.flightCategory ?? "VFR", ["MVFR", "IFR", "LIFR"], {
        [metar.flightCategory ?? "VFR"]: `Flight category is derived from reported visibility (${metar.visibility?.raw ?? "not limited"}) and cloud ceiling (${cloudSummary(metar)}).`,
      }),
    }),
    ...maybeQuestion(metar.wind && {
      id: `q-${idPrefix}-wind`,
      prompt: `From this METAR, what wind speed is reported for ${metar.station}?`,
      metar,
      metarRaw,
      difficulty: "easy",
      skillTag: "wind",
      choices: buildChoices(`${metar.wind.speedKt} KT`, [`${Math.max(metar.wind.speedKt - 4, 0)} KT`, `${metar.wind.speedKt + 6} KT`, "Calm"], {
        [`${metar.wind.speedKt} KT`]: `The wind group reports ${metar.wind.direction ?? "VRB"}${String(metar.wind.speedKt).padStart(2, "0")}KT${metar.wind.gustKt ? ` with gusts to ${metar.wind.gustKt} KT` : ""}.`,
      }),
    }),
    ...maybeQuestion(metar.visibility && {
      id: `q-${idPrefix}-vis`,
      prompt: `Looking only at the METAR below, what visibility is reported at ${metar.station}?`,
      metar,
      metarRaw,
      difficulty: "medium",
      skillTag: "visibility",
      choices: buildChoices(`${metar.visibility.statuteMiles} SM`, ["1 SM", "3 SM", "10+ SM"], {
        [`${metar.visibility.statuteMiles} SM`]: `${metar.visibility.raw} decodes to approximately ${metar.visibility.statuteMiles} statute miles${metar.visibility.cavok ? " with CAVOK conditions" : ""}.`,
      }),
    }),
    ...maybeQuestion({
      id: `q-${idPrefix}-ceiling`,
      prompt: "What cloud/ceiling interpretation best matches this exact METAR string?",
      metar,
      metarRaw,
      difficulty: "medium",
      skillTag: "clouds",
      choices: buildChoices(ceilingFromClouds(metarRaw), ["Scattered only (no ceiling)", "Clear sky", "Thunderstorm ceiling"], {
        [ceilingFromClouds(metarRaw)]: `Ceiling comes from BKN, OVC, or VV layers; this report has ${cloudSummary(metar)}.`,
      }),
    }),
    ...maybeQuestion(metar.temperature && {
      id: `q-${idPrefix}-tempdew`,
      prompt: `In this METAR, which temperature/dewpoint pair for ${metar.station} is correct?`,
      metar,
      metarRaw,
      difficulty: "hard",
      skillTag: "temperature",
      choices: buildChoices(`${metar.temperature.celsius}/${metar.temperature.dewpointCelsius}°C`, [`${metar.temperature.dewpointCelsius}/${metar.temperature.celsius}°C`, `${metar.temperature.celsius + 3}/${metar.temperature.dewpointCelsius}°C`, `${metar.temperature.celsius}/${metar.temperature.dewpointCelsius - 4}°C`], {
        [`${metar.temperature.celsius}/${metar.temperature.dewpointCelsius}°C`]: "The temperature group is read as temperature/dewpoint in Celsius; M before a value means below zero.",
      }),
    }),
    ...maybeQuestion(metar.altimeter && {
      id: `q-${idPrefix}-altimeter`,
      prompt: `Which altimeter/QNH value is reported for ${metar.station}?`,
      metar,
      metarRaw,
      difficulty: "medium",
      skillTag: "altimeter",
      choices: buildChoices(metar.altimeter.hectopascals ? `${metar.altimeter.hectopascals} hPa` : `${metar.altimeter.inchesHg.toFixed(2)} inHg`, ["1013 hPa", "29.92 inHg", "1000 hPa"], {
        [metar.altimeter.hectopascals ? `${metar.altimeter.hectopascals} hPa` : `${metar.altimeter.inchesHg.toFixed(2)} inHg`]: "Q groups are hPa; A groups are inches of mercury.",
      }),
    }),
    ...maybeQuestion(metar.weather.length > 0 && {
      id: `q-${idPrefix}-weather`,
      prompt: `Which present weather code appears in this METAR for ${metar.station}?`,
      metar,
      metarRaw,
      difficulty: "hard",
      skillTag: "weather",
      choices: buildChoices(metar.weather[0].raw, ["CAVOK", "NOSIG", "SKC"], {
        [metar.weather[0].raw]: `${metar.weather[0].raw} is a present-weather group, not a cloud or trend token.`,
      }),
    }),
  ];
}

export function buildQuestionBank(): QuizQuestion[] {
  return metarExamples.flatMap((example) => buildQuestionsFromMetar(example.id, example.rawText, example.parsed));
}

export function buildDynamicQuestionBank(entries: Array<{ id: string; rawText: string; metar: ParsedMetar }>): QuizQuestion[] {
  return entries.flatMap((entry) => buildQuestionsFromMetar(entry.id, entry.rawText, entry.metar));
}
