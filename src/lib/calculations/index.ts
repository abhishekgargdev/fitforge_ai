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

/** Percent change vs previous value (0 when there is no usable previous). */
export function progressDelta(current: number, previous: number): number {
  if (previous === 0 || !Number.isFinite(previous) || !Number.isFinite(current)) return 0;
  return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
}

export function absoluteDelta(current: number, previous: number | undefined | null): number {
  if (previous == null || !Number.isFinite(previous) || !Number.isFinite(current)) return 0;
  return Math.round((current - previous) * 10) / 10;
}

export type TrendDirection = "up" | "down" | "stable";

export function progressTrend(
  current: number,
  previous: number | undefined | null,
  epsilon = 0.15
): TrendDirection {
  if (previous == null || !Number.isFinite(previous) || !Number.isFinite(current)) {
    return "stable";
  }
  const delta = current - previous;
  if (Math.abs(delta) <= epsilon) return "stable";
  return delta > 0 ? "up" : "down";
}

export type ChartPoint = { date: string; label: string; value: number };

export function chartSeries(points: ChartPoint[]): Array<ChartPoint & { deltaPercent: number }> {
  return points.map((point, index) => ({
    ...point,
    deltaPercent: index === 0 ? 0 : progressDelta(point.value, points[index - 1]?.value || 0),
  }));
}

export function recompositionScore(input: {
  fatDelta: number;
  muscleDelta: number;
  waistDelta: number;
  visceralDelta: number;
}): number {
  let score = 70;
  if (input.fatDelta < 0) score += Math.min(12, Math.round(Math.abs(input.fatDelta) * 4));
  else score -= Math.min(12, Math.round(input.fatDelta * 4));
  if (input.muscleDelta > 0) score += Math.min(10, Math.round(input.muscleDelta * 6));
  else score -= Math.min(8, Math.round(Math.abs(input.muscleDelta) * 4));
  if (input.waistDelta < 0) score += 5;
  else if (input.waistDelta > 0.8) score -= 5;
  if (input.visceralDelta < 0) score += 5;
  else if (input.visceralDelta > 0) score -= 5;
  return Math.max(1, Math.min(100, score));
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
