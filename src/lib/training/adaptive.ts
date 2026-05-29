import type { UserProgress } from "@/types/progress";
import type { QuizQuestion } from "@/types/quiz";

export type SkillMastery = {
  skillTag: string;
  accuracy: number;
  confidence: number;
  mastery: number;
  due: boolean;
  priority: number;
  nextReviewAt?: string;
  reason: string;
};

const SKILL_LABELS: Record<string, string> = {
  wind: "wind decoding",
  visibility: "visibility and RVR",
  clouds: "ceilings and cloud layers",
  altimeter: "QNH / altimeter",
  temperature: "temperature and dewpoint",
  weather: "present weather",
  taf: "TAF changes",
  scan: "full METAR scan",
};

function safeDate(value?: string) {
  const time = value ? Date.parse(value) : Number.NaN;
  return Number.isFinite(time) ? time : 0;
}

export function getSkillLabel(skillTag: string): string {
  return SKILL_LABELS[skillTag] ?? skillTag;
}

export function getSkillMastery(progress: UserProgress | null, now = new Date()): SkillMastery[] {
  const skills = progress?.skills ?? [];
  const nowMs = now.getTime();
  return skills
    .map((skill) => {
      const total = skill.correct + skill.incorrect;
      const accuracy = total ? skill.correct / total : 0;
      const confidence = Math.min(1, total / 20);
      const streakBoost = Math.min(0.12, skill.streak * 0.025);
      const mastery = Math.max(0, Math.min(1, accuracy * 0.75 + confidence * 0.2 + streakBoost));
      const due = !skill.nextReviewAt || safeDate(skill.nextReviewAt) <= nowMs;
      const recencyPenalty = skill.lastAnsweredAt ? Math.min(0.18, Math.max(0, nowMs - safeDate(skill.lastAnsweredAt)) / 86_400_000 / 30) : 0.18;
      const priority = Math.round((1 - mastery + (due ? 0.25 : 0) + recencyPenalty) * 100);
      const reason = due
        ? `${getSkillLabel(skill.skillTag)} is due for review${accuracy < 0.75 ? " and accuracy is below the target band" : " to protect retention"}.`
        : `${getSkillLabel(skill.skillTag)} is scheduled for spaced repetition.`;
      return {
        skillTag: skill.skillTag,
        accuracy: Math.round(accuracy * 100),
        confidence: Math.round(confidence * 100),
        mastery: Math.round(mastery * 100),
        due,
        priority,
        nextReviewAt: skill.nextReviewAt,
        reason,
      };
    })
    .sort((a, b) => b.priority - a.priority || a.mastery - b.mastery);
}

export function getNextRecommendedDrill(progress: UserProgress | null, questions: QuizQuestion[]) {
  const mastery = getSkillMastery(progress);
  const fallbackSkill = mastery[0]?.skillTag ?? "wind";
  const targetSkill = mastery.find((item) => item.due)?.skillTag ?? fallbackSkill;
  const pool = questions.filter((question) => question.skillTag === targetSkill);
  const nextQuestions = (pool.length ? pool : questions).slice(0, 10);
  const reason = mastery[0]?.reason ?? "Start with a short baseline drill so METAR Quest can measure your strengths.";
  return {
    targetSkill,
    href: `/quiz?skill=${encodeURIComponent(targetSkill)}`,
    reason,
    questions: nextQuestions,
    mastery,
  };
}
