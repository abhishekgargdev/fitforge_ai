import { bmi } from "@/lib/calculations";
import { getOrCreateNutritionGoals } from "@/lib/nutrition/goals";
import { todayDate, toLogDto } from "@/lib/nutrition/map";
import { toComposition } from "@/lib/progress/map";
import { buildProgressSeries, buildProgressSummary, measurementsInRange } from "@/lib/progress/series";
import type { ProgressRange } from "@/lib/progress/types";
import { toSplitDto, sessionToSummary } from "@/lib/workouts/map";
import { BodyMeasurement } from "@/models/BodyMeasurement";
import { FitnessGoalModel } from "@/models/FitnessGoal";
import { FoodLogModel } from "@/models/FoodLog";
import { Profile } from "@/models/Profile";
import { User } from "@/models/User";
import { WorkoutPlanModel } from "@/models/WorkoutPlan";
import { WorkoutSessionModel } from "@/models/WorkoutSession";
import { assembleUserProfile } from "@/lib/profile/assemble";
import { emptyWorkout } from "@/lib/dashboard/empty";

export function todayPlanIndex(daysLength: number) {
  if (daysLength <= 0) return 0;
  const mondayBased = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  return mondayBased % daysLength;
}

export async function getDashboardData(userId: unknown, range: ProgressRange = "3m") {
  const [user, profile, goal, nutritionGoals, foodLogs, activePlan, measurementRows, latestWeightRow, latestTwoScans, recentSessions] =
    await Promise.all([
      User.findById(userId),
      Profile.findOne({ userId }),
      FitnessGoalModel.findOne({ userId }),
      getOrCreateNutritionGoals(userId),
      FoodLogModel.find({ userId, date: todayDate() }).sort({ loggedAt: 1 }),
      WorkoutPlanModel.findOne({ userId, isActive: true }),
      measurementsInRange(userId, range),
      BodyMeasurement.findOne({ userId, weightKg: { $ne: null } }).sort({ date: -1 }),
      BodyMeasurement.find({ userId, origin: { $ne: 'WORKOUT_CHECKIN' } }).sort({ date: -1 }).limit(2),
      WorkoutSessionModel.find({ userId, status: "completed" }).sort({ completedAt: -1 }).limit(5),
    ]);

  if (!user || !profile || !goal) {
    throw new Error("Profile not found");
  }

  const userProfile = assembleUserProfile(user, profile, goal);
  const calculatedBmi = bmi(profile.weightKg, profile.heightCm);
  const progressSummary = buildProgressSummary(measurementRows);
  const weightSeries = buildProgressSeries(measurementRows, "weight");
  const latestScan = latestTwoScans[0] || null;
  const previousScan = latestTwoScans[1] || null;
  const composition = toComposition(latestScan);
  const previousComposition = previousScan ? toComposition(previousScan) : null;

  const split = activePlan ? toSplitDto(activePlan) : null;
  let dayIndex = 0;
  if (split && split.days.length) {
    const firstTraining = split.days.findIndex((day) => !day.isRestDay && day.workout);
    const calendarIndex = todayPlanIndex(split.days.length);
    const calendarDay = split.days[calendarIndex];
    dayIndex =
      calendarDay && !calendarDay.isRestDay && calendarDay.workout
        ? calendarIndex
        : firstTraining >= 0
          ? firstTraining
          : calendarIndex;
  }
  const todayDay = split?.days[dayIndex];
  const todayWorkout = todayDay?.workout || emptyWorkout;
  const isRestDay = Boolean(!todayDay || todayDay.isRestDay || !todayDay.workout);

  const meals = foodLogs.map(toLogDto);
  const nutritionTotals = meals.reduce(
    (acc, row) => ({
      caloriesKcal: acc.caloriesKcal + row.caloriesKcal,
      proteinGrams: acc.proteinGrams + row.proteinGrams,
      carbsGrams: acc.carbsGrams + row.carbsGrams,
      fatGrams: acc.fatGrams + row.fatGrams,
    }),
    { caloriesKcal: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0 }
  );

  const targetWeightKg = goal.targetWeightKg;
  const weightKg = latestWeightRow?.weightKg ?? profile.weightKg;
  const distance = Math.abs(weightKg - targetWeightKg);
  const span = Math.max(Math.abs((previousScan?.weightKg ?? weightKg) - targetWeightKg), 0.5);
  const weightProgressPct = Math.max(0, Math.min(100, Math.round((1 - distance / span) * 100)));

  const fatDelta = progressSummary.metrics.fat.absDelta;
  const muscleDelta = progressSummary.metrics.muscle.absDelta;
  const insight =
    measurementRows.length < 2
      ? "Log a second body scan to calculate recomposition trend. I will not invent a progress story from a single data point."
      : fatDelta < 0 && muscleDelta >= 0
        ? `Body fat changed ${fatDelta}% while muscle mass changed ${muscleDelta > 0 ? "+" : ""}${muscleDelta} kg versus your previous scan. That pattern is consistent with recomposition from measured data.`
        : `Latest measured change: weight ${progressSummary.metrics.weight.absDelta > 0 ? "+" : ""}${progressSummary.metrics.weight.absDelta} kg, body fat ${fatDelta > 0 ? "+" : ""}${fatDelta}%. Use Progress for the full calculated series.`;

  const bmiLabel =
    calculatedBmi >= 35 || calculatedBmi < 17
      ? "Speak with a clinician"
      : calculatedBmi < 18.5
        ? "Below typical range"
        : calculatedBmi < 25
          ? "Typical range"
          : calculatedBmi < 30
            ? "Above typical range"
            : "Elevated range";

  return {
    profile: userProfile,
    targetWeightKg,
    metrics: {
      weightKg,
      weightDelta: progressSummary.metrics.weight.absDelta,
      weightProgressPct,
      bodyFatPercentage: latestScan?.bodyFatPercentage ?? profile.bodyFatPercentage,
      fatDelta: progressSummary.metrics.fat.absDelta,
      bmi: calculatedBmi,
      bmiLabel,
      bodyAge: composition.overall.bodyAge || profile.age,
      bodyAgeDelta: composition.overall.bodyAge
        ? profile.age - composition.overall.bodyAge
        : 0,
    },
    nutrition: {
      meals,
      totals: nutritionTotals,
      goals: {
        targetCaloriesKcal: nutritionGoals.targetCaloriesKcal,
        targetProteinGrams: nutritionGoals.targetProteinGrams,
        targetCarbsGrams: nutritionGoals.targetCarbsGrams,
        targetFatGrams: nutritionGoals.targetFatGrams,
        targetFiberGrams: nutritionGoals.targetFiberGrams,
      },
    },
    workout: {
      planId: split?.id || "",
      planTitle: split?.title || "",
      dayIndex,
      isRestDay,
      focus: todayDay?.focus || "",
      todayWorkout,
    },
    progress: {
      range,
      series: weightSeries.series,
      metricEntries: progressSummary.metricEntries,
      composition,
      previousComposition,
      insight,
    },
    recentWorkouts: recentSessions.map(sessionToSummary),
  };
}

export function coachContextFromDashboard(data: Awaited<ReturnType<typeof getDashboardData>>) {
  const cleanMetrics: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data.metrics)) {
    if (value !== null && value !== undefined) {
      cleanMetrics[key] = value;
    }
  }

  return {
    profile: {
      name: data.profile.name,
      age: data.profile.age,
      goal: data.profile.fitnessGoal,
      experience: data.profile.experienceLevel,
      trainingDaysPerWeek: data.profile.trainingDaysPerWeek,
      allergies: data.profile.allergies,
    },
    latestMetrics: cleanMetrics,
    nutritionToday: {
      totals: data.nutrition.totals,
      goals: data.nutrition.goals,
    },
    todayWorkout: data.workout.isRestDay
      ? { restDay: true, focus: data.workout.focus }
      : {
          name: data.workout.todayWorkout.name,
          durationMinutes: data.workout.todayWorkout.durationMinutes,
          exercises: data.workout.todayWorkout.exercises.map((ex) => ({
            name: ex.exerciseName,
            sets: ex.sets,
            reps: ex.reps,
          })),
        },
    recentWorkouts: data.recentWorkouts.slice(0, 3).map((row) => ({
      name: row.workoutName,
      date: row.date,
      volumeKg: row.totalVolumeKg,
    })),
  };
}
