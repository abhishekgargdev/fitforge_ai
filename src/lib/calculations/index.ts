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
}): {
  targetCaloriesKcal: number;
  targetProteinGrams: number;
  targetCarbsGrams: number;
  targetFatGrams: number;
} {
  const targetCaloriesKcal =
    input.goal === "lose_fat"
      ? Math.round(input.tdeeKcal - 500)
      : input.goal === "build_muscle" || input.goal === "strength"
        ? Math.round(input.tdeeKcal + 300)
        : input.tdeeKcal;

  const targetProteinGrams = Math.round(input.weightKg * 2.0);
  const targetFatGrams = Math.round((targetCaloriesKcal * 0.25) / 9);
  const targetCarbsGrams = Math.round(
    (targetCaloriesKcal - (targetProteinGrams * 4 + targetFatGrams * 9)) / 4
  );

  return {
    targetCaloriesKcal,
    targetProteinGrams,
    targetCarbsGrams,
    targetFatGrams,
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
