export interface SkillProgress {
  skillTag: string;
  correct: number;
  incorrect: number;
  streak: number;
}

export interface UserProgress {
  userId: string;
  totalAnswered: number;
  totalCorrect: number;
  updatedAt: string;
  skills: SkillProgress[];
}

export interface ProgressSnapshot {
  sessionId: string;
  score: number;
  answered: number;
  completedAt: string;
}

export type ProgressMode = "quiz" | "time-attack";
