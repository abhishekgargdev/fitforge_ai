import { fail, ok } from "@/lib/api/response";
import { clearSessionCookie, requireSessionUser } from "@/lib/auth/session";
import { BodyMeasurement } from "@/models/BodyMeasurement";
import { FitnessGoalModel } from "@/models/FitnessGoal";
import { PasswordResetToken } from "@/models/PasswordResetToken";
import { Profile } from "@/models/Profile";
import { User } from "@/models/User";

export async function DELETE() {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");

    const userId = session.user._id;
    await Promise.all([
      BodyMeasurement.deleteMany({ userId }),
      FitnessGoalModel.deleteMany({ userId }),
      Profile.deleteMany({ userId }),
      PasswordResetToken.deleteMany({ userId }),
    ]);
    await User.deleteOne({ _id: userId });
    await clearSessionCookie();

    return ok({ deleted: true });
  } catch (error) {
    console.error("[account:delete]", error);
    return fail("Unable to delete account.", 500, "ACCOUNT_DELETE_FAILED");
  }
}
