import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { plannerInputSchema } from "@/lib/validation/workouts";
import { generateAndSaveWorkoutPlan } from "@/lib/workouts/generate";
import { toSplitDto } from "@/lib/workouts/map";

export async function POST(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const json = await request.json();
    const parsed = plannerInputSchema.safeParse({
      ...json,
      daysPerWeek: json.daysPerWeek ?? json.daysPerWeek,
      duration: json.duration ?? json.workoutDurationMinutes,
      equipment: json.equipment ?? json.availableEquipment,
    });
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input", 400, "VALIDATION_ERROR");
    }
    const plan = await generateAndSaveWorkoutPlan(session.user._id, parsed.data);
    return ok({
      plan: toSplitDto(plan),
      planTitle: plan.title,
      daysPerWeek: plan.daysPerWeek,
      weeklySchedule: toSplitDto(plan).days,
    });
  } catch (error) {
    console.error("[ai:workout-plan]", error);
    return fail("Unable to generate a workout plan right now.", 500, "AI_WORKOUT_PLAN_FAILED");
  }
}
