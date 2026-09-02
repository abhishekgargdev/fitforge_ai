import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { assembleUserProfile } from "@/lib/profile/assemble";
import { updateProfileSchema } from "@/lib/validation/profile";
import { bmi } from "@/lib/calculations";
import { BodyMeasurement } from "@/models/BodyMeasurement";
import { FitnessGoalModel } from "@/models/FitnessGoal";
import { Profile } from "@/models/Profile";
import { User } from "@/models/User";
import { createSessionCookie } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");

    const [profile, goal] = await Promise.all([
      Profile.findOne({ userId: session.user._id }),
      FitnessGoalModel.findOne({ userId: session.user._id }),
    ]);
    if (!profile || !goal) {
      return fail("Profile not found.", 404, "PROFILE_NOT_FOUND");
    }

    return ok({
      profile: assembleUserProfile(session.user, profile, goal),
      memberSince: session.user.createdAt
        ? new Date(session.user.createdAt).toISOString()
        : null,
    });
  } catch (error) {
    console.error("[profile:get]", error);
    return fail("Unable to load profile.", 500, "PROFILE_LOAD_FAILED");
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");

    const json = await request.json();
    const parsed = updateProfileSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input", 400, "VALIDATION_ERROR");
    }

    const body = parsed.data;
    const profile = await Profile.findOne({ userId: session.user._id });
    const goal = await FitnessGoalModel.findOne({ userId: session.user._id });
    if (!profile || !goal) {
      return fail("Profile not found.", 404, "PROFILE_NOT_FOUND");
    }

    const weightChanged = profile.weightKg !== body.weightKg;
    const fatChanged = profile.bodyFatPercentage !== body.bodyFatPercentage;
    const heightChanged = profile.heightCm !== body.heightCm;

    profile.age = body.age;
    profile.gender = body.gender;
    profile.heightCm = body.heightCm;
    profile.weightKg = body.weightKg;
    profile.bodyFatPercentage = body.bodyFatPercentage;
    await profile.save();

    if (session.user.name !== body.name) {
      session.user.name = body.name;
      await session.user.save();
      await createSessionCookie({
        userId: String(session.user._id),
        email: session.user.email,
        name: body.name,
        onboardingComplete: session.user.onboardingComplete,
      });
    }

    if (weightChanged || fatChanged || heightChanged) {
      await new BodyMeasurement({
        userId: session.user._id,
        date: new Date(),
        weightKg: body.weightKg,
        bodyFatPercentage: body.bodyFatPercentage,
        bmi: bmi(body.weightKg, body.heightCm),
        origin: "MEASURED",
      }).save();
    }

    const freshUser = await User.findById(session.user._id);
    return ok({
      profile: assembleUserProfile(freshUser ?? session.user, profile, goal),
      memberSince: session.user.createdAt
        ? new Date(session.user.createdAt).toISOString()
        : null,
    });
  } catch (error) {
    console.error("[profile:put]", error);
    return fail("Unable to save profile.", 500, "PROFILE_SAVE_FAILED");
  }
}
