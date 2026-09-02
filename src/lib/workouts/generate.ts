import { generateStructuredJson } from "@/lib/ai/orchestrator";
import { workoutPlanSystemPrompt, workoutPlanUserPrompt } from "@/lib/ai/prompts/workout-plan";
import { aiWorkoutPlanSchema } from "@/lib/ai/schemas/workout-plan";
import { recordAiUsage } from "@/lib/ai/usage";
import { catalogNamesForPlanner, resolvePlanDays } from "@/lib/workouts/resolve";
import { WorkoutPlanModel } from "@/models/WorkoutPlan";

export type PlannerInput = {
  goal: string;
  daysPerWeek: number;
  duration: number;
  experience: string;
  equipment: string[];
  focusMuscles: string[];
  preferences?: string;
};

export async function generateAndSaveWorkoutPlan(
  userId: unknown,
  input: PlannerInput
) {
  const activePlan = await WorkoutPlanModel.findOne({ userId, isActive: true });
  
  // Format locked constraints for prompt
  let lockedConstraints = "";
  if (activePlan?.days) {
    const lockedItems: string[] = [];
    activePlan.days.forEach((day: { dayName: string; locked?: boolean; workout?: { name: string; exercises?: Array<{ exerciseName: string; locked?: boolean }> } }) => {
      if (day.locked) {
        lockedItems.push(`Day ${day.dayName}: FULL DAY LOCKED (${day.workout?.name || "Workout"})`);
      } else if (day.workout?.exercises) {
        const lockedExs = day.workout.exercises.filter((ex) => ex.locked).map((ex) => ex.exerciseName);
        if (lockedExs.length > 0) {
          lockedItems.push(`Day ${day.dayName}: Keep exact exercises: ${lockedExs.join(", ")}`);
        }
      }
    });
    if (lockedItems.length > 0) {
      lockedConstraints = lockedItems.join("\n");
    }
  }

  const catalog = await catalogNamesForPlanner(input.focusMuscles);
  let aiPlan;
  try {
    aiPlan = await generateStructuredJson({
      system: workoutPlanSystemPrompt(),
      user: workoutPlanUserPrompt({
        ...input,
        preferences: input.preferences || "",
        catalog,
        lockedConstraints,
      }),
      schema: aiWorkoutPlanSchema,
    });
    await recordAiUsage({ userId, feature: "workout-plan", ok: true });
  } catch (error) {
    await recordAiUsage({ userId, feature: "workout-plan", ok: false });
    throw error;
  }

  const resolved = await resolvePlanDays(aiPlan);
  if (resolved.trainingDays === 0) {
    throw new Error("AI plan did not resolve to any catalog exercises");
  }

  // Preserve locked days and locked exercises from active plan
  if (activePlan?.days) {
    resolved.days = resolved.days.map((newDay) => {
      const oldDay = activePlan.days.find((d: { dayName: string }) => d.dayName === newDay.dayName);
      if (!oldDay) return newDay;
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
    plannerInputs: input,
  });
  return plan;
}
