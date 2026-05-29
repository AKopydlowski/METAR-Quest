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
  const now = new Date();
  const previousAttempts = existing?.attempts ?? (existing ? existing.correct + existing.incorrect : 0);
  const attempts = previousAttempts + 1;
  const streak = isCorrect ? (existing?.streak ?? 0) + 1 : 0;
  const ease = Math.max(1.3, Math.min(2.8, (existing?.ease ?? 2.1) + (isCorrect ? 0.12 : -0.28)));
  const intervalDays = isCorrect ? Math.max(1, Math.round(Math.min(21, ease * Math.max(1, streak)))) : 1;
  const nextReview = new Date(now.getTime() + intervalDays * 86_400_000);
  const updated: SkillProgress = {
    skillTag,
    correct: (existing?.correct ?? 0) + (isCorrect ? 1 : 0),
    incorrect: (existing?.incorrect ?? 0) + (isCorrect ? 0 : 1),
    streak,
    attempts,
    lastAnsweredAt: now.toISOString(),
    nextReviewAt: nextReview.toISOString(),
    ease,
  };

  return [...skills.filter((skill) => skill.skillTag !== skillTag), updated].sort((a, b) => a.skillTag.localeCompare(b.skillTag));
}

export function clearProgress(userId: string, mode: ProgressMode): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getProgressStorageKey(userId, mode));
}


export function exportProgressBundle(userId = "local-user"): string {
  if (typeof window === "undefined") return "{}";
  const keys = Object.keys(window.localStorage).filter((key) => key.startsWith(PREFIX) || key.startsWith("metar-quest:leaderboard") || key.startsWith("metar-quest:daily"));
  const data = Object.fromEntries(keys.map((key) => [key, window.localStorage.getItem(key)]));
  return JSON.stringify({ version: 1, userId, exportedAt: new Date().toISOString(), data }, null, 2);
}

export function importProgressBundle(bundle: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const parsed = JSON.parse(bundle) as { data?: Record<string, string | null> };
    if (!parsed.data) return false;
    Object.entries(parsed.data).forEach(([key, value]) => {
      if ((key.startsWith(PREFIX) || key.startsWith("metar-quest:leaderboard") || key.startsWith("metar-quest:daily")) && value !== null) {
        window.localStorage.setItem(key, value);
      }
    });
    return true;
  } catch {
    return false;
  }
}
