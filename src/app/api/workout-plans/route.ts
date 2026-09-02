import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { plannerInputSchema } from "@/lib/validation/workouts";
import { generateAndSaveWorkoutPlan } from "@/lib/workouts/generate";
import { toSplitDto } from "@/lib/workouts/map";
import { WorkoutPlanModel } from "@/models/WorkoutPlan";

export async function GET(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");

    const url = new URL(request.url);
    const pageParam = url.searchParams.get("page");
    const limitParam = url.searchParams.get("limit");

    if (pageParam || limitParam) {
      const page = Math.max(1, parseInt(pageParam || "1", 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(limitParam || "20", 10) || 20));
      const skip = (page - 1) * limit;
      const [plans, total] = await Promise.all([
        WorkoutPlanModel.find({ userId: session.user._id })
          .sort({ isActive: -1, updatedAt: -1 })
          .skip(skip)
          .limit(limit),
        WorkoutPlanModel.countDocuments({ userId: session.user._id }),
      ]);
      const activeDoc = plans.find((plan) => plan.isActive);
      return ok({
        items: plans.map(toSplitDto),
        active: activeDoc ? toSplitDto(activeDoc) : null,
        pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      });
    }

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
