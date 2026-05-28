import type { ProgressMode, SkillProgress, UserProgress } from "@/types/progress";

const PREFIX = "metar-quest:progress:";

export function getProgressStorageKey(userId: string, mode: ProgressMode): string {
  return `${PREFIX}${userId}:${mode}`;
}

export function loadProgress(userId: string, mode: ProgressMode): UserProgress | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(getProgressStorageKey(userId, mode));
  if (!raw) return null;

  try {
    return JSON.parse(raw) as UserProgress;
  } catch {
    return null;
  }
}

export function saveProgress(progress: UserProgress, mode: ProgressMode): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getProgressStorageKey(progress.userId, mode), JSON.stringify(progress));
}

export function recordProgressAnswer(userId: string, mode: ProgressMode, skillTag: string, isCorrect: boolean): void {
  const existing = loadProgress(userId, mode);
  const skills = updateSkillProgress(existing?.skills ?? [], skillTag, isCorrect);

  saveProgress(
    {
      userId,
      totalAnswered: (existing?.totalAnswered ?? 0) + 1,
      totalCorrect: (existing?.totalCorrect ?? 0) + (isCorrect ? 1 : 0),
      updatedAt: new Date().toISOString(),
      skills,
    },
    mode,
  );
}

export function updateSkillProgress(skills: SkillProgress[], skillTag: string, isCorrect: boolean): SkillProgress[] {
  const existing = skills.find((skill) => skill.skillTag === skillTag);
  const updated: SkillProgress = {
    skillTag,
    correct: (existing?.correct ?? 0) + (isCorrect ? 1 : 0),
    incorrect: (existing?.incorrect ?? 0) + (isCorrect ? 0 : 1),
    streak: isCorrect ? (existing?.streak ?? 0) + 1 : 0,
  };

  return [...skills.filter((skill) => skill.skillTag !== skillTag), updated].sort((a, b) => a.skillTag.localeCompare(b.skillTag));
}

export function clearProgress(userId: string, mode: ProgressMode): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getProgressStorageKey(userId, mode));
}
