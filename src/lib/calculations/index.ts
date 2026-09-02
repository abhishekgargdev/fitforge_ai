import type { FitnessGoal } from "@/types";

export function bmi(weightKg: number, heightCm: number): number {
  const meters = heightCm / 100;
  if (meters <= 0) return 0;
  return Math.round((weightKg / (meters * meters)) * 10) / 10;
}

export function bmr(input: {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: "male" | "female" | "other";
}): number {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
  const offset = input.gender === "female" ? -161 : 5;
  return Math.round(base + offset);
}

export function activityFactorFromTrainingDays(daysPerWeek: number): number {
  if (daysPerWeek >= 5) return 1.6;
  if (daysPerWeek >= 4) return 1.45;
  return 1.35;
}

export function tdee(bmrKcal: number, activityFactor: number): number {
  return Math.round(bmrKcal * activityFactor);
}

export function macroTargets(input: {
  tdeeKcal: number;
  weightKg: number;
  goal: FitnessGoal;
  dietType?: "balanced" | "high_protein" | "low_carb" | "keto" | "vegetarian" | "vegan" | "mediterranean";
}): {
  targetCaloriesKcal: number;
  targetProteinGrams: number;
  targetCarbsGrams: number;
  targetFatGrams: number;
  targetFiberGrams: number;
} {
  const targetCaloriesKcal =
    input.goal === "lose_fat"
      ? Math.round(input.tdeeKcal - 500)
      : input.goal === "build_muscle" || input.goal === "strength"
        ? Math.round(input.tdeeKcal + 300)
        : input.tdeeKcal;

  const diet = input.dietType || "high_protein";
  const proteinPerKg =
    diet === "high_protein" || input.goal === "build_muscle" || input.goal === "strength"
      ? 2.2
      : diet === "keto" || diet === "low_carb"
        ? 1.8
        : 1.6;
  const targetProteinGrams = Math.round(input.weightKg * proteinPerKg);

  const fatFraction =
    diet === "keto" ? 0.7 : diet === "low_carb" ? 0.4 : diet === "mediterranean" ? 0.35 : 0.25;
  const carbFloor = diet === "keto" ? 40 : 0;
  const targetFatGrams = Math.round((targetCaloriesKcal * fatFraction) / 9);
  const remainingKcal = Math.max(
    0,
    targetCaloriesKcal - (targetProteinGrams * 4 + targetFatGrams * 9)
  );
  const targetCarbsGrams = Math.max(carbFloor, Math.round(remainingKcal / 4));
  const targetFiberGrams = Math.max(25, Math.round((targetCaloriesKcal / 1000) * 14));

  return {
    targetCaloriesKcal,
    targetProteinGrams,
    targetCarbsGrams,
    targetFatGrams,
    targetFiberGrams,
  };
}

export function workoutVolume(
  sets: Array<{ weightKg: number; reps: number }>
): number {
  return sets.reduce((sum, set) => sum + set.weightKg * set.reps, 0);
}

/** Percent change vs previous value (0 when there is no previous session). */
export function progressDelta(current: number, previous: number): number {
  if (!previous) return 0;
  return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
}

export function estimatedWorkoutCalories(
  durationMinutes: number,
  weightKg: number
): number {
  const met = 6;
  const minutes = Math.max(1, durationMinutes);
  const kg = weightKg > 0 ? weightKg : 75;
  return Math.round(((met * 3.5 * kg) / 200) * minutes);
}
