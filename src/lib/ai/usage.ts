import { todayDate } from "@/lib/nutrition/map";
import { AIUsageModel } from "@/models/AIUsage";

export type AiFeature = "chat" | "nutrition-plan" | "workout-plan" | "progress-analysis";

export async function recordAiUsage(input: {
  userId: unknown;
  feature: AiFeature;
  ok: boolean;
}) {
  try {
    await AIUsageModel.create({
      userId: input.userId,
      feature: input.feature,
      ok: input.ok,
      date: todayDate(),
    });
  } catch (error) {
    console.error("[ai:usage]", error);
  }
}

export async function aggregateAiUsage(userId: unknown) {
  const today = todayDate();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekDate = todayDate(weekAgo.toISOString().slice(0, 10));

  const [todayRows, weekRows, featureRows] = await Promise.all([
    AIUsageModel.aggregate([
      { $match: { userId, date: today } },
      { $group: { _id: null, requests: { $sum: 1 }, success: { $sum: { $cond: ["$ok", 1, 0] } } } },
    ]),
    AIUsageModel.aggregate([
      { $match: { userId, date: { $gte: weekDate } } },
      { $group: { _id: null, requests: { $sum: 1 }, success: { $sum: { $cond: ["$ok", 1, 0] } } } },
    ]),
    AIUsageModel.aggregate([
      { $match: { userId, date: { $gte: weekDate } } },
      { $group: { _id: "$feature", requests: { $sum: 1 } } },
    ]),
  ]);

  const byFeature: Record<string, number> = {};
  for (const row of featureRows) {
    byFeature[row._id] = row.requests;
  }

  return {
    today: {
      requests: todayRows[0]?.requests ?? 0,
      success: todayRows[0]?.success ?? 0,
    },
    last7d: {
      requests: weekRows[0]?.requests ?? 0,
      success: weekRows[0]?.success ?? 0,
    },
    byFeature,
  };
}
