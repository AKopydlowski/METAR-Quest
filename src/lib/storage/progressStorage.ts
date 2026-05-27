import type { ProgressMode, UserProgress } from "@/types/progress";

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

export function clearProgress(userId: string, mode: ProgressMode): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getProgressStorageKey(userId, mode));
}
