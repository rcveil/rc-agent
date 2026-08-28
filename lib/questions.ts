import questionsData from "@/data/questions.json";

export type Dimension =
  | "academic_effort"
  | "emotional_wellbeing"
  | "social_relationships"
  | "character_values"
  | "physical_rest"
  | "resilience_mindset";

export type AgeGroup = "p1-p3" | "p4-p6";

export interface Question {
  id: string;
  dimension: Dimension;
  ageGroup: AgeGroup;
  text: string;
}

export const DIMENSION_LABELS: Record<Dimension, string> = {
  academic_effort: "Academic Effort",
  emotional_wellbeing: "Emotional Wellbeing",
  social_relationships: "Social & Relationships",
  character_values: "Character & Values",
  physical_rest: "Physical & Rest",
  resilience_mindset: "Resilience & Mindset",
};

export const DIMENSION_COLORS: Record<Dimension, string> = {
  academic_effort: "bg-blue-100 text-blue-800",
  emotional_wellbeing: "bg-amber-100 text-amber-800",
  social_relationships: "bg-green-100 text-green-800",
  character_values: "bg-purple-100 text-purple-800",
  physical_rest: "bg-rose-100 text-rose-800",
  resilience_mindset: "bg-orange-100 text-orange-800",
};

const questions = questionsData as Question[];

export function ageGroupFromYear(schoolYear: number): AgeGroup {
  return schoolYear <= 3 ? "p1-p3" : "p4-p6";
}

const DIMENSION_ORDER: Dimension[] = [
  "academic_effort",
  "emotional_wellbeing",
  "social_relationships",
  "character_values",
  "physical_rest",
  "resilience_mindset",
];

export function pickQuestion(
  schoolYear: number,
  recentQuestionIds: string[]
): Question {
  const ageGroup = ageGroupFromYear(schoolYear);
  const eligible = questions.filter(
    (q) => q.ageGroup === ageGroup && !recentQuestionIds.includes(q.id)
  );

  const pool = eligible.length > 0
    ? eligible
    : questions.filter((q) => q.ageGroup === ageGroup);

  const recentDimensions = new Set(
    recentQuestionIds
      .map((id) => questions.find((q) => q.id === id)?.dimension)
      .filter(Boolean) as Dimension[]
  );

  const leastUsedDimension = DIMENSION_ORDER.find(
    (d) => !recentDimensions.has(d)
  );

  const preferred = leastUsedDimension
    ? pool.filter((q) => q.dimension === leastUsedDimension)
    : pool;

  const source = preferred.length > 0 ? preferred : pool;
  return source[Math.floor(Math.random() * source.length)];
}
