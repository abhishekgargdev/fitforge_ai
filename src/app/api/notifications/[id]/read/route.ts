import mongoose from "mongoose";
import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { toNotificationDto } from "@/lib/notifications/map";
import { NotificationModel } from "@/models/Notification";

export async function PUT(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");

    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) {
      return fail("Invalid notification ID", 400, "VALIDATION_ERROR");
    }

    const updated = await NotificationModel.findOneAndUpdate(
      { _id: id, userId: session.user._id },
      { $set: { read: true } },
      { new: true }
    );

    if (!updated) {
      return fail("Notification not found", 404, "NOTIFICATION_NOT_FOUND");
    }

    return ok({ notification: toNotificationDto(updated) });
  } catch (error) {
    console.error("[notifications:read-one]", error);
    return fail("Unable to mark notification as read.", 500, "NOTIFICATION_UPDATE_FAILED");
  }
}
