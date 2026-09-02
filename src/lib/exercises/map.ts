import type { Exercise } from "@/types";
import type { ExerciseDbRaw } from "@/lib/exercisedb/client";

export type ExerciseDocShape = {
  exerciseId: string;
  name: string;
  bodyParts: string[];
  targetMuscles: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipments: string[];
  difficulty: Exercise["difficulty"];
  exerciseType: Exercise["exerciseType"];
  gifUrl: string;
  instructions: string[];
  commonMistakes: string[];
  tips: string[];
  source?: "catalog" | "user";
  createdBy?: string;
  cloudinaryPublicId?: string;
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
  const bodyParts = raw.bodyParts?.length
    ? raw.bodyParts
    : raw.bodyPart
    ? [raw.bodyPart.trim()]
    : [];
  const targetMuscles = raw.targetMuscles?.length
    ? raw.targetMuscles
    : raw.target
    ? [raw.target.trim()]
    : bodyParts;
  const equipments = raw.equipments?.length
    ? raw.equipments
    : raw.equipment
    ? [raw.equipment.trim()]
    : ["body weight"];
  const gifUrl = raw.gifUrl || raw.gifUrls?.["360p"] || raw.gifUrls?.["480p"] || "";

  if (!exerciseId || !name || bodyParts.length === 0 || !gifUrl) return null;

  return {
    exerciseId,
    name,
    bodyParts,
    targetMuscles,
    primaryMuscles: targetMuscles,
    secondaryMuscles: raw.secondaryMuscles ?? [],
    equipments,
    difficulty: titleCaseDifficulty(raw.difficulty),
    exerciseType: titleCaseType(raw.exerciseTypes?.[0] || raw.category),
    gifUrl,
    instructions: raw.instructions ?? [],
    commonMistakes: [],
    tips: [],
    source: "catalog",
  };
}

export function toExerciseDto(doc: any): Exercise {
  const bodyParts = Array.isArray(doc.bodyParts) && doc.bodyParts.length > 0
    ? doc.bodyParts
    : doc.bodyPart
    ? [doc.bodyPart]
    : [];
  const targetMuscles = Array.isArray(doc.targetMuscles) && doc.targetMuscles.length > 0
    ? doc.targetMuscles
    : doc.target
    ? [doc.target]
    : bodyParts;
  const equipments = Array.isArray(doc.equipments) && doc.equipments.length > 0
    ? doc.equipments
    : doc.equipment
    ? [doc.equipment]
    : ["body weight"];

  return {
    id: doc.exerciseId || String(doc._id),
    exerciseId: doc.exerciseId || String(doc._id),
    name: doc.name,
    bodyParts,
    targetMuscles,
    equipments,
    secondaryMuscles: doc.secondaryMuscles ?? [],
    bodyPart: bodyParts[0] || "",
    targetMuscle: targetMuscles[0] || "",
    primaryMuscles: doc.primaryMuscles ?? targetMuscles,
    equipment: equipments[0] || "body weight",
    difficulty: doc.difficulty || "Intermediate",
    exerciseType: doc.exerciseType || "Strength",
    category: bodyParts[0] || "General",
    imageUrl: doc.gifUrl,
    gifUrl: doc.gifUrl,
    instructions: doc.instructions ?? [],
    musclesWorkedVisual: {
      primary: doc.primaryMuscles ?? targetMuscles,
      secondary: doc.secondaryMuscles ?? [],
    },
    commonMistakes: doc.commonMistakes ?? [],
    tips: doc.tips ?? [],
    source: doc.source || "catalog",
    createdBy: doc.createdBy ? String(doc.createdBy) : undefined,
    cloudinaryPublicId: doc.cloudinaryPublicId,
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
    core: ["waist", "abs", "obliques"],
    "abs / core": ["waist", "abs", "obliques"],
    abs: ["waist", "abs", "obliques"],
    waist: ["waist", "abs", "obliques"],
    obliques: ["waist", "abs", "obliques"],
    cardio: "cardio",
    neck: "neck",
  };
  return map[key] ?? key;
}

export function targetQueryValue(raw: string) {
  const key = raw.trim().toLowerCase();
  const map: Record<string, string | string[]> = {
    biceps: "biceps",
    triceps: "triceps",
    quads: "quadriceps",
    quadriceps: "quadriceps",
    hamstrings: "hamstrings",
    glutes: "glutes",
    calves: "calves",
    abs: ["abs", "obliques", "waist"],
    "abs / core": ["abs", "obliques", "waist"],
    core: ["abs", "obliques", "waist"],
    obliques: "obliques",
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
