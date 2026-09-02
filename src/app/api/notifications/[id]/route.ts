import mongoose from "mongoose";
import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { NotificationModel } from "@/models/Notification";

export async function DELETE(
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

    const deleted = await NotificationModel.findOneAndDelete({
      _id: id,
      userId: session.user._id,
    });

    if (!deleted) {
      return fail("Notification not found", 404, "NOTIFICATION_NOT_FOUND");
    }

    return ok({ success: true, id });
  } catch (error) {
    console.error("[notifications:delete]", error);
    return fail("Unable to delete notification.", 500, "NOTIFICATION_DELETE_FAILED");
  }
}
