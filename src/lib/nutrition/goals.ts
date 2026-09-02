import {
  activityFactorFromTrainingDays,
  bmr,
  macroTargets,
  tdee,
} from "@/lib/calculations";
import type { DailyNutritionTarget, DietType, FitnessGoal } from "@/types";
import { FitnessGoalModel } from "@/models/FitnessGoal";
import { NutritionGoalModel } from "@/models/NutritionGoal";
import { Profile } from "@/models/Profile";

export async function computedNutritionTargets(userId: unknown): Promise<DailyNutritionTarget> {
  const [profile, goal] = await Promise.all([
    Profile.findOne({ userId }),
    FitnessGoalModel.findOne({ userId }),
  ]);
  const weightKg = profile?.weightKg || 75;
  const bmrKcal = bmr({
    weightKg,
    heightCm: profile?.heightCm || 175,
    age: profile?.age || 30,
    gender: profile?.gender || "male",
  });
  const tdeeKcal = tdee(
    bmrKcal,
    activityFactorFromTrainingDays(goal?.trainingDaysPerWeek || 4)
  );
  return macroTargets({
    tdeeKcal,
    weightKg,
    goal: (goal?.fitnessGoal as FitnessGoal) || "build_muscle",
    dietType: "high_protein",
  });
}

export async function getOrCreateNutritionGoals(userId: unknown) {
  const existing = await NutritionGoalModel.findOne({ userId });
  if (existing) return existing;
  const computed = await computedNutritionTargets(userId);
  return NutritionGoalModel.create({
    userId,
    ...computed,
    dietType: "high_protein" as DietType,
    mealsPerDay: 4,
  });
}
