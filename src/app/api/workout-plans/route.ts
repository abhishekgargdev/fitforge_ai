import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { plannerInputSchema } from "@/lib/validation/workouts";
import { generateAndSaveWorkoutPlan } from "@/lib/workouts/generate";
import { toSplitDto } from "@/lib/workouts/map";
import { WorkoutPlanModel } from "@/models/WorkoutPlan";

export async function GET() {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");

    const plans = await WorkoutPlanModel.find({ userId: session.user._id }).sort({
      isActive: -1,
      updatedAt: -1,
    });
    const activeDoc = plans.find((plan) => plan.isActive);
    return ok({
      items: plans.map(toSplitDto),
      active: activeDoc ? toSplitDto(activeDoc) : null,
    });
  } catch (error) {
    console.error("[workout-plans:list]", error);
    return fail("Unable to load workout plans.", 500, "PLANS_LOAD_FAILED");
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const json = await request.json();
    const parsed = plannerInputSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input", 400, "VALIDATION_ERROR");
    }
    const plan = await generateAndSaveWorkoutPlan(session.user._id, parsed.data);
    return ok({ plan: toSplitDto(plan) }, 201);
  } catch (error) {
    console.error("[workout-plans:create]", error);
    return fail("Unable to create workout plan.", 500, "PLAN_CREATE_FAILED");
  }
}
