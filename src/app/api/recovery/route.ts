import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/mongodb";
import { RecoveryPlanModel } from "@/models/RecoveryPlan";

export async function GET(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date") || new Date().toISOString().split("T")[0];

    await connectDB();
    let plan = await RecoveryPlanModel.findOne({ userId: session.user._id, date: dateStr });

    if (!plan) {
      // Fallback default recovery plan if none generated yet today
      const defaultItems = [
        {
          type: "shower",
          title: "Contrast Hydrotherapy",
          description: "Alternate 30 seconds cold water with 2 minutes warm water for 3 cycles to reduce inflammation.",
          source: "ai",
        },
        {
          type: "hydration",
          title: "Hydration & Electrolyte Reset",
          description: "Drink 500ml of water with a pinch of sea salt or an electrolyte blend to replenish fluid losses.",
          source: "ai",
        },
        {
          type: "stretch",
          title: "Post-Workout Lower Body Stretch",
          description: "Hold hamstrings, quads, and hip flexors static stretches for 30s per side.",
          source: "ai",
        },
        {
          type: "meditation",
          title: "Parasympathetic Down-Regulation",
          description: "5 minutes of 4-7-8 box breathing to accelerate recovery transition.",
          source: "ai",
        },
        {
          type: "supplement",
          title: "General Magnesium Support",
          description: "Magnesium is commonly used to support muscle relaxation and sleep (check with a pharmacist or doctor before starting anything new).",
          source: "ai",
        },
      ];

      plan = await RecoveryPlanModel.create({
        userId: session.user._id,
        date: dateStr,
        items: defaultItems,
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
    console.error("[recovery:get]", error);
    return fail(
      error instanceof Error ? error.message : "Failed to load recovery plan",
      500,
      "SERVER_ERROR"
    );
  }
}
