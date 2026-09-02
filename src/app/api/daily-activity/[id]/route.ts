import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/mongodb";
import { DailyActivityLogModel } from "@/models/DailyActivityLog";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");

    const { id } = await context.params;
    const body = await request.json();

    await connectDB();
    const log = await DailyActivityLogModel.findOne({ _id: id, userId: session.user._id });
    if (!log) return fail("Activity log not found", 404, "NOT_FOUND");

    if (typeof body.steps === "number") log.steps = body.steps;
    if (typeof body.activityType === "string") log.activityType = body.activityType.trim();
    if (typeof body.durationMinutes === "number") log.durationMinutes = body.durationMinutes;
    if (typeof body.notes === "string") log.notes = body.notes.trim();

    await log.save();

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
    console.error("[daily-activity:put]", error);
    return fail("Failed to update daily activity", 500, "SERVER_ERROR");
  }
}
