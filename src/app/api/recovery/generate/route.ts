import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/mongodb";
import { RecoveryPlanModel } from "@/models/RecoveryPlan";
import { generateStructuredJson } from "@/lib/ai/orchestrator";
import { recoverySystemPrompt, recoveryUserPrompt } from "@/lib/ai/prompts/recovery";
import { recoveryPlanSchema } from "@/lib/ai/schemas/recovery";
import { recordAiUsage } from "@/lib/ai/usage";

export async function POST(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");

    const body = await request.json().catch(() => ({}));
    const { isRestDay = false, workoutName, workoutVolumeKg, workoutDurationMinutes, targetMuscles } = body;

    let aiResult;
    try {
      aiResult = await generateStructuredJson({
        system: recoverySystemPrompt(),
        user: recoveryUserPrompt({
          isRestDay,
          workoutName,
          workoutVolumeKg,
          workoutDurationMinutes,
          targetMuscles,
        }),
        schema: recoveryPlanSchema,
      });
      await recordAiUsage({ userId: session.user._id, feature: "progress-analysis", ok: true });
    } catch (err) {
      await recordAiUsage({ userId: session.user._id, feature: "progress-analysis", ok: false });
      throw err;
    }

    // Ensure supplement caveats are enforced
    const sanitizedItems = aiResult.items.map((item) => {
      if (item.type === "supplement" && !item.description.includes("pharmacist or doctor")) {
        return {
          ...item,
          description: `${item.description} (check with a pharmacist or doctor before starting anything new)`,
        };
      }
      return { ...item, source: "ai" };
    });

    const dateStr = new Date().toISOString().split("T")[0];
    await connectDB();

    let plan = await RecoveryPlanModel.findOne({ userId: session.user._id, date: dateStr });
    if (plan) {
      plan.items = sanitizedItems;
      await plan.save();
    } else {
      plan = await RecoveryPlanModel.create({
        userId: session.user._id,
        date: dateStr,
        items: sanitizedItems,
        origin: "AI_RECOMMENDATION",
      });
    }

    return ok({
      plan: {
        id: String(plan._id),
        userId: String(plan.userId),
        date: plan.date,
        items: plan.items,
        origin: plan.origin || "AI_RECOMMENDATION",
      },
    });
  } catch (error) {
    console.error("[recovery:generate]", error);
    return fail(
      error instanceof Error ? error.message : "Failed to generate recovery plan",
      500,
      "SERVER_ERROR"
    );
  }
}
