import type { UserProgress } from "@/types/progress";

const PREFIX = "metar-quest:progress:";

export function getProgressStorageKey(userId: string): string {
  return `${PREFIX}${userId}`;
}

export function loadProgress(userId: string): UserProgress | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(getProgressStorageKey(userId));
  if (!raw) return null;

  try {
    return JSON.parse(raw) as UserProgress;
  } catch {
    return null;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getProgressStorageKey(progress.userId), JSON.stringify(progress));
}

export function clearProgress(userId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getProgressStorageKey(userId));
}
