import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { NotificationModel } from "@/models/Notification";

export async function PUT() {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");

    const result = await NotificationModel.updateMany(
      { userId: session.user._id, read: false },
      { $set: { read: true } }
    );

    return ok({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("[notifications:read-all]", error);
    return fail("Unable to mark notifications as read.", 500, "NOTIFICATIONS_UPDATE_FAILED");
  }
}
