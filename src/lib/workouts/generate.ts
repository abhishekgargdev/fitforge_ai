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
  const catalog = await catalogNamesForPlanner(input.focusMuscles);
  let aiPlan;
  try {
    aiPlan = await generateStructuredJson({
    system: workoutPlanSystemPrompt(),
    user: workoutPlanUserPrompt({
      ...input,
      preferences: input.preferences || "",
      catalog,
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
