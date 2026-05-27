import type { QuizChoice, QuizQuestion } from "@/types/quiz";
import { metarExamples } from "./examples";

function buildChoices(correct: string, incorrect: string[]): QuizChoice[] {
  return [
    { id: `c-${correct}`, label: correct, isCorrect: true },
    ...incorrect.map((label) => ({ id: `c-${label}`, label, isCorrect: false })),
  ];
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
