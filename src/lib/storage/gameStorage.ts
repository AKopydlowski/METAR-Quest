export type ThemeMode = "dark" | "light";

export type GameSettings = {
  theme: ThemeMode;
  fontScale: "normal" | "large";
  highContrast: boolean;
};

export type DailyChallengeRecord = {
  date: string;
  score: number;
  total: number;
};

export type Achievement = {
  id: string;
  name: string;
  unlocked: boolean;
};

const SETTINGS_KEY = "metar-quest:settings";
const LEADERBOARD_KEY = "metar-quest:leaderboard";
const DAILY_KEY = "metar-quest:daily";

export function loadSettings(): GameSettings {
  if (typeof window === "undefined") return { theme: "dark", fontScale: "normal", highContrast: false };
  const raw = window.localStorage.getItem(SETTINGS_KEY);
  if (!raw) return { theme: "dark", fontScale: "normal", highContrast: false };
  try {
    return JSON.parse(raw) as GameSettings;
  } catch {
    return { theme: "dark", fontScale: "normal", highContrast: false };
  }
}

export function saveSettings(settings: GameSettings): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function saveLeaderboardEntry(mode: "quiz" | "time-attack" | "mission" | "exam", score: number): void {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(LEADERBOARD_KEY);
  const current = raw ? (JSON.parse(raw) as { mode: string; score: number; at: string }[]) : [];
  current.push({ mode, score, at: new Date().toISOString() });
  const trimmed = current.sort((a, b) => b.score - a.score).slice(0, 20);
  window.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmed));
}

export function loadLeaderboard(): { mode: string; score: number; at: string }[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(LEADERBOARD_KEY);
  return raw ? (JSON.parse(raw) as { mode: string; score: number; at: string }[]) : [];
}

export function saveDailyChallenge(record: DailyChallengeRecord): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DAILY_KEY, JSON.stringify(record));
}

export function loadDailyChallenge(): DailyChallengeRecord | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(DAILY_KEY);
  return raw ? (JSON.parse(raw) as DailyChallengeRecord) : null;
}

export function getAchievements(stats: { quizAccuracy: number; totalAnswered: number; bestTimeAttack: number }): Achievement[] {
  return [
    { id: "first-steps", name: "First Steps", unlocked: stats.totalAnswered >= 10 },
    { id: "metar-master", name: "METAR Master", unlocked: stats.quizAccuracy >= 80 },
    { id: "speedster", name: "Speedster", unlocked: stats.bestTimeAttack >= 8 },
    { id: "crosswind-spotter", name: "Crosswind Spotter", unlocked: stats.totalAnswered >= 25 && stats.bestTimeAttack >= 12 },
    { id: "ifr-ceiling-hunter", name: "IFR Ceiling Hunter", unlocked: stats.quizAccuracy >= 85 && stats.totalAnswered >= 40 },
    { id: "daily-dispatch", name: "Daily Dispatch", unlocked: stats.totalAnswered >= 60 },
  ];
}
