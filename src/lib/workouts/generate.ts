import { generateStructuredJson } from "@/lib/ai/orchestrator";
import { workoutPlanSystemPrompt, workoutPlanUserPrompt } from "@/lib/ai/prompts/workout-plan";
import { aiWorkoutPlanSchema } from "@/lib/ai/schemas/workout-plan";
import { recordAiUsage } from "@/lib/ai/usage";
import { catalogNamesForPlanner, resolvePlanDays } from "@/lib/workouts/resolve";
import { WorkoutPlanModel } from "@/models/WorkoutPlan";

export type PlannerInput = {
  goal: string | string[];
  daysPerWeek: number;
  trainingDays?: string[];
  duration: number;
  experience: string;
  equipment: string[];
  focusMuscles: string[];
  preferences?: string;
  planIntent?: string | string[];
};

const DAY_MAP: Record<string, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

import { FitnessGoalModel } from "@/models/FitnessGoal";
import { WorkoutSessionModel } from "@/models/WorkoutSession";

export async function generateAndSaveWorkoutPlan(
  userId: any,
  input: PlannerInput
) {
  console.log(`[generateAndSaveWorkoutPlan] Starting generation for user ${userId}. Inputs:`, {
    goal: input.goal,
    daysPerWeek: input.daysPerWeek,
    trainingDays: input.trainingDays,
    duration: input.duration,
    experience: input.experience,
    focusMuscles: input.focusMuscles,
  });

  const [activePlan, goalDoc, completedSessions, recentSessions] = await Promise.all([
    WorkoutPlanModel.findOne({ userId, isActive: true }),
    FitnessGoalModel.findOne({ userId }),
    WorkoutSessionModel.countDocuments({ userId, status: "completed" }),
    WorkoutSessionModel.find({ userId, status: "completed" }).sort({ completedAt: -1 }).limit(5),
  ]);

  const isFirstPlan = completedSessions === 0;
  let recentSessionSummary = "";
  if (recentSessions.length > 0) {
    const avgDuration = Math.round(
      recentSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0) / recentSessions.length
    );
    recentSessionSummary = `${recentSessions.length} recent completed workouts, avg duration ${avgDuration} mins.`;
  }
  
  const effectiveDays = input.trainingDays?.length
    ? input.trainingDays
    : goalDoc?.trainingDays?.length
    ? goalDoc.trainingDays
    : undefined;

  const allowedDayNames = effectiveDays
    ? effectiveDays.map((d: string) => DAY_MAP[d.toLowerCase()] || d)
    : undefined;

  console.log(`[generateAndSaveWorkoutPlan] Effective training days:`, effectiveDays, "Allowed day names:", allowedDayNames);

  // Format locked constraints for prompt
  let lockedConstraints = "";
  if (activePlan?.days) {
    const lockedItems: string[] = [];
    activePlan.days.forEach((day: any) => {
      if (day.locked) {
        lockedItems.push(`Day ${day.dayName}: FULL DAY LOCKED (${day.workout?.name || "Workout"})`);
      } else if (day.workout?.exercises) {
        const lockedExs = day.workout.exercises.filter((ex: any) => ex.locked).map((ex: any) => ex.exerciseName);
        if (lockedExs.length > 0) {
          lockedItems.push(`Day ${day.dayName}: Keep exact exercises: ${lockedExs.join(", ")}`);
        }
      }
    });
    if (lockedItems.length > 0) {
      lockedConstraints = lockedItems.join("\n");
      console.log(`[generateAndSaveWorkoutPlan] Preserving locked constraints:\n${lockedConstraints}`);
    }
  }

  const catalog = await catalogNamesForPlanner(input.focusMuscles);
  console.log(`[generateAndSaveWorkoutPlan] Passing catalog of ${catalog.length} exercise names to AI orchestrator.`);

  let aiPlan;
  try {
    aiPlan = await generateStructuredJson({
      system: workoutPlanSystemPrompt(),
      user: workoutPlanUserPrompt({
        goal: Array.isArray(input.goal) ? input.goal.join(", ") : input.goal,
        daysPerWeek: input.daysPerWeek,
        trainingDays: effectiveDays,
        duration: input.duration,
        experience: input.experience,
        equipment: input.equipment,
        focusMuscles: input.focusMuscles,
        preferences: input.preferences || "",
        planIntent: input.planIntent
          ? Array.isArray(input.planIntent)
            ? input.planIntent.join(", ")
            : input.planIntent
          : undefined,
        catalog,
        isFirstPlan,
        completedSessionsCount: completedSessions,
        recentSessionSummary,
        lockedConstraints,
        allowedDayNames,
      }),
      schema: aiWorkoutPlanSchema,
    });
    console.log(`[generateAndSaveWorkoutPlan] AI successfully generated plan titled "${aiPlan.planTitle}" with ${aiPlan.days.length} days.`);
    await recordAiUsage({ userId, feature: "workout-plan", ok: true });
  } catch (error) {
    console.error(`[generateAndSaveWorkoutPlan] AI Orchestrator failed:`, error);
    await recordAiUsage({ userId, feature: "workout-plan", ok: false });
    throw error;
  }

  const resolved = await resolvePlanDays(aiPlan, allowedDayNames);
  console.log(`[generateAndSaveWorkoutPlan] Plan day resolution finished. Resolved training days: ${resolved.trainingDays}`);

  if (resolved.trainingDays === 0) {
    console.error(`[generateAndSaveWorkoutPlan] ERROR: AI plan days count resolved to 0! Raw AI days were:`, JSON.stringify(aiPlan.days, null, 2));
    throw new Error("AI plan did not resolve to any catalog exercises");
  }

  // Preserve locked days and locked exercises from active plan
  if (activePlan?.days) {
    resolved.days = resolved.days.map((newDay: any) => {
      const oldDayDoc = activePlan.days.find((d: { dayName: string }) => d.dayName === newDay.dayName);
      if (!oldDayDoc) return newDay;
      const oldDay: any = typeof (oldDayDoc as any).toObject === "function" ? (oldDayDoc as any).toObject() : oldDayDoc;
      if (oldDay.locked) {
        return oldDay; // Keep entire locked day
      }
      if (oldDay.workout?.exercises && newDay.workout?.exercises) {
        const lockedOldExs = oldDay.workout.exercises.filter((ex: { locked?: boolean }) => ex.locked);
        if (lockedOldExs.length > 0) {
          // Merge locked exercises into new day's exercises
          const mergedExercises = [...newDay.workout.exercises];
          lockedOldExs.forEach((lockedEx: { exerciseName: string }) => {
            const exists = mergedExercises.some((e) => e.exerciseName === lockedEx.exerciseName);
            if (!exists) {
              mergedExercises.unshift(lockedEx as typeof mergedExercises[0]);
            }
          });
          newDay.workout.exercises = mergedExercises;
        }
      }
      return newDay;
    });
  }

  const nextPlanGenerationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await WorkoutPlanModel.updateMany({ userId }, { isActive: false });
  const plan = await WorkoutPlanModel.create({
    userId,
    title: aiPlan.planTitle,
    daysPerWeek: input.daysPerWeek,
    isActive: true,
    planMode: "ai",
    nextPlanGenerationDate,
    origin: "AI_RECOMMENDATION",
    days: resolved.days,
    plannerInputs: {
      ...input,
      goal: Array.isArray(input.goal) ? input.goal.join(", ") : input.goal,
    },
  });
  console.log(`[generateAndSaveWorkoutPlan] Successfully saved new workout plan ID: ${plan._id}`);
  return plan;
}
