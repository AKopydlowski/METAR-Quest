import type { ParsedMetar } from "./metar";

export type QuestionDifficulty = "easy" | "medium" | "hard";

export interface QuizChoice {
  id: string;
  label: string;
  isCorrect: boolean;
  rationale?: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  metar: ParsedMetar;
  metarRaw: string;
  choices: QuizChoice[];
  difficulty: QuestionDifficulty;
  skillTag:
    | "wind"
    | "visibility"
    | "clouds"
    | "altimeter"
    | "temperature"
    | "weather";
}

export interface QuizAttempt {
  questionId: string;
  choiceId: string;
  correct: boolean;
  answeredAt: string;
}

export interface QuizSession {
  id: string;
  startedAt: string;
  completedAt?: string;
  questions: QuizQuestion[];
  attempts: QuizAttempt[];
}
