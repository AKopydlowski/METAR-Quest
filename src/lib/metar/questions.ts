import type { QuizChoice, QuizQuestion } from "@/types/quiz";
import { metarExamples } from "./examples";

function buildChoices(correct: string, incorrect: string[]): QuizChoice[] {
  const deduped = [correct, ...incorrect].filter(
    (label, index, arr) => arr.indexOf(label) === index,
  );

  return deduped.map((label) => ({
    id: `c-${correct}-${label}`,
    label,
    isCorrect: label === correct,
  }));
}

export function buildQuestionBank(): QuizQuestion[] {
  return metarExamples.map((example) => ({
    id: `q-${example.id}-category`,
    prompt: `What is the flight category for ${example.parsed.station}?`,
    metar: example.parsed,
    difficulty: "easy",
    skillTag: "clouds",
    choices: buildChoices(example.parsed.flightCategory ?? "VFR", ["MVFR", "IFR", "LIFR"]).slice(0, 4),
  }));
}
