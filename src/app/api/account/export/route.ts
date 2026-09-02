import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { assembleUserProfile, assembleUserSettings, toPublicUser } from "@/lib/profile/assemble";
import { BodyMeasurement } from "@/models/BodyMeasurement";
import { FitnessGoalModel } from "@/models/FitnessGoal";
import { Profile } from "@/models/Profile";

export async function GET() {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");

    const userId = session.user._id;
    const [profile, goal, measurements] = await Promise.all([
      Profile.findOne({ userId }),
      FitnessGoalModel.findOne({ userId }),
      BodyMeasurement.find({ userId }).sort({ date: 1 }),
    ]);
    if (!profile || !goal) {
      return fail("Profile not found.", 404, "PROFILE_NOT_FOUND");
    }

    return ok({
      exportedAt: new Date().toISOString(),
      user: toPublicUser(session.user),
      profile: assembleUserProfile(session.user, profile, goal),
      settings: assembleUserSettings(profile),
      fitnessGoal: {
        fitnessGoal: goal.fitnessGoal,
        targetWeightKg: goal.targetWeightKg,
        focusMuscles: goal.focusMuscles ?? [],
        experienceLevel: goal.experienceLevel,
        trainingDaysPerWeek: goal.trainingDaysPerWeek,
        workoutDurationMinutes: goal.workoutDurationMinutes,
        availableEquipment: goal.availableEquipment,
      },
      bodyMeasurements: measurements.map((row) => ({
        id: String(row._id),
        date: row.date.toISOString(),
        weightKg: row.weightKg,
        bodyFatPercentage: row.bodyFatPercentage,
        bmi: row.bmi,
        origin: row.origin,
      })),
    });
  } catch (error) {
    console.error("[account:export]", error);
    return fail("Unable to export account.", 500, "ACCOUNT_EXPORT_FAILED");
  }
}
