import type { Exercise } from "@/types";
import type { ExerciseDbRaw } from "@/lib/exercisedb/client";

export type ExerciseDocShape = {
  exerciseId: string;
  name: string;
  bodyPart: string;
  target: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string;
  difficulty: Exercise["difficulty"];
  exerciseType: Exercise["exerciseType"];
  gifUrl: string;
  instructions: string[];
  commonMistakes: string[];
  tips: string[];
};

function titleCaseDifficulty(value?: string): Exercise["difficulty"] {
  const lower = (value || "intermediate").toLowerCase();
  if (lower === "beginner") return "Beginner";
  if (lower === "advanced") return "Advanced";
  return "Intermediate";
}

function titleCaseType(value?: string): Exercise["exerciseType"] {
  const lower = (value || "strength").toLowerCase();
  if (lower.includes("cardio")) return "Cardio";
  if (lower.includes("mobility") || lower.includes("stretch")) return "Mobility";
  if (lower.includes("hypertrophy")) return "Hypertrophy";
  return "Strength";
}

export function mapExerciseDbItem(raw: ExerciseDbRaw): ExerciseDocShape | null {
  const exerciseId = raw.exerciseId || raw.id;
  const name = raw.name?.trim();
  const bodyPart = (raw.bodyParts?.[0] || raw.bodyPart || "").trim();
  const target = (raw.targetMuscles?.[0] || raw.target || bodyPart).trim();
  const equipment = (raw.equipments?.[0] || raw.equipment || "body weight").trim();
  const gifUrl = raw.gifUrl || raw.gifUrls?.["360p"] || raw.gifUrls?.["480p"] || "";
  if (!exerciseId || !name || !bodyPart || !gifUrl) return null;

  const primaryMuscles =
    raw.targetMuscles && raw.targetMuscles.length > 0 ? raw.targetMuscles : [target];

  return {
    exerciseId,
    name,
    bodyPart,
    target,
    primaryMuscles,
    secondaryMuscles: raw.secondaryMuscles ?? [],
    equipment,
    difficulty: titleCaseDifficulty(raw.difficulty),
    exerciseType: titleCaseType(raw.exerciseTypes?.[0] || raw.category),
    gifUrl,
    instructions: raw.instructions ?? [],
    commonMistakes: [],
    tips: [],
  };
}

export function toExerciseDto(doc: ExerciseDocShape): Exercise {
  return {
    id: doc.exerciseId,
    name: doc.name,
    bodyPart: doc.bodyPart,
    targetMuscle: doc.target,
    primaryMuscles: doc.primaryMuscles,
    secondaryMuscles: doc.secondaryMuscles,
    equipment: doc.equipment,
    difficulty: doc.difficulty,
    exerciseType: doc.exerciseType,
    category: doc.bodyPart,
    imageUrl: doc.gifUrl,
    gifUrl: doc.gifUrl,
    instructions: doc.instructions,
    musclesWorkedVisual: {
      primary: doc.primaryMuscles,
      secondary: doc.secondaryMuscles,
    },
    commonMistakes: doc.commonMistakes ?? [],
    tips: doc.tips ?? [],
  };
}

export function bodyPartQueryValue(raw: string) {
  const key = raw.trim().toLowerCase();
  const map: Record<string, string | string[]> = {
    chest: "chest",
    back: "back",
    shoulders: "shoulders",
    arms: ["upper arms", "lower arms"],
    "upper arms": "upper arms",
    "lower arms": "lower arms",
    legs: ["upper legs", "lower legs"],
    "upper legs": "upper legs",
    "lower legs": "lower legs",
    core: "waist",
    waist: "waist",
    cardio: "cardio",
    neck: "neck",
  };
  return map[key] ?? key;
}

export function targetQueryValue(raw: string) {
  const key = raw.trim().toLowerCase();
  const map: Record<string, string> = {
    biceps: "biceps",
    triceps: "triceps",
    quads: "quadriceps",
    quadriceps: "quadriceps",
    hamstrings: "hamstrings",
    glutes: "glutes",
    calves: "calves",
    abs: "abs",
    pectorals: "pectorals",
    chest: "pectorals",
  };
  return map[key] ?? key;
}

export function equipmentQueryValue(raw: string) {
  const key = raw.trim().toLowerCase();
  if (key === "dumbbells" || key === "dumbbell") return /dumbbell/i;
  if (key === "bodyweight" || key === "body weight") return /body weight|bodyweight/i;
  if (key === "machines" || key === "machine") return /machine|cable|smith/i;
  if (key === "barbell") return /barbell/i;
  return new RegExp(raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}
