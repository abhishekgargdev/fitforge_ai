import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/mongodb";
import { DailyActivityLogModel } from "@/models/DailyActivityLog";

export async function GET(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    await connectDB();
    const query: Record<string, any> = { userId: session.user._id };

    if (dateStr) {
      query.date = dateStr;
    } else if (from && to) {
      query.date = { $gte: from, $lte: to };
    } else if (from) {
      query.date = { $gte: from };
    }

    const items = await DailyActivityLogModel.find(query).sort({ date: -1 }).limit(100);

    const logs = items.map((item) => ({
      id: String(item._id),
      userId: String(item.userId),
      date: item.date,
      steps: item.steps,
      activityType: item.activityType,
      durationMinutes: item.durationMinutes,
      notes: item.notes,
      createdAt: item.createdAt,
    }));

    return ok({ logs });
  } catch (error) {
    console.error("[daily-activity:get]", error);
    return fail("Failed to fetch daily activity logs", 500, "SERVER_ERROR");
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");

    const body = await request.json();
    const dateStr = body.date || new Date().toISOString().split("T")[0];

    const steps = typeof body.steps === "number" ? body.steps : undefined;
    const activityType = typeof body.activityType === "string" ? body.activityType.trim() : undefined;
    const durationMinutes = typeof body.durationMinutes === "number" ? body.durationMinutes : undefined;
    const notes = typeof body.notes === "string" ? body.notes.trim() : undefined;

    await connectDB();

    let log = await DailyActivityLogModel.findOne({ userId: session.user._id, date: dateStr });
    if (log) {
      if (steps !== undefined) log.steps = steps;
      if (activityType !== undefined) log.activityType = activityType;
      if (durationMinutes !== undefined) log.durationMinutes = durationMinutes;
      if (notes !== undefined) log.notes = notes;
      await log.save();
    } else {
      log = await DailyActivityLogModel.create({
        userId: session.user._id,
        date: dateStr,
        steps,
        activityType,
        durationMinutes,
        notes,
      });
    }

    return ok({
      log: {
        id: String(log._id),
        userId: String(log.userId),
        date: log.date,
        steps: log.steps,
        activityType: log.activityType,
        durationMinutes: log.durationMinutes,
        notes: log.notes,
      },
    });
  } catch (error) {
    console.error("[daily-activity:post]", error);
    return fail("Failed to log daily activity", 500, "SERVER_ERROR");
  }
}
