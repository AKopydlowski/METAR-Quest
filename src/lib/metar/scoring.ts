import type { QuizAttempt, QuizQuestion } from "@/types/quiz";
import type { ProgressSnapshot, SkillProgress, UserProgress } from "@/types/progress";

export function scoreAttempts(attempts: QuizAttempt[], questions: QuizQuestion[]): number {
  if (questions.length === 0) return 0;
  const correct = attempts.filter((attempt) => attempt.correct).length;
  return Math.round((correct / questions.length) * 100);
}

export function buildProgressSnapshot(sessionId: string, attempts: QuizAttempt[]): ProgressSnapshot {
  const score = attempts.length === 0 ? 0 : Math.round((attempts.filter((a) => a.correct).length / attempts.length) * 100);

  return {
    sessionId,
    score,
    answered: attempts.length,
    completedAt: new Date().toISOString(),
  };
}

export function updateSkillProgress(current: SkillProgress, wasCorrect: boolean): SkillProgress {
  return {
    ...current,
    correct: current.correct + (wasCorrect ? 1 : 0),
    incorrect: current.incorrect + (wasCorrect ? 0 : 1),
    streak: wasCorrect ? current.streak + 1 : 0,
  };
}

export function getAccuracy(progress: UserProgress): number {
  if (progress.totalAnswered === 0) return 0;
  return progress.totalCorrect / progress.totalAnswered;
}
