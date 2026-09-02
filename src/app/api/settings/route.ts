import { fail, ok } from "@/lib/api/response";
import { createSessionCookie, requireSessionUser } from "@/lib/auth/session";
import { assembleUserSettings } from "@/lib/profile/assemble";
import { updateSettingsSchema } from "@/lib/validation/profile";
import { Profile } from "@/models/Profile";

export async function GET() {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");

    const profile = await Profile.findOne({ userId: session.user._id });
    if (!profile) {
      return fail("Profile not found.", 404, "PROFILE_NOT_FOUND");
    }

    return ok({ settings: assembleUserSettings(profile) });
  } catch (error) {
    console.error("[settings:get]", error);
    return fail("Unable to load settings.", 500, "SETTINGS_LOAD_FAILED");
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");

    const json = await request.json();
    const parsed = updateSettingsSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input", 400, "VALIDATION_ERROR");
    }

    const body = parsed.data;
    const profile = await Profile.findOneAndUpdate(
      { userId: session.user._id },
      {
        unitSystem: body.unitSystem,
        theme: body.theme,
        aiPersona: body.aiPersona,
        audioChimes: body.audioChimes,
        planMode: body.planMode,
      },
      { returnDocument: "after" }
    );
    if (!profile) {
      return fail("Profile not found.", 404, "PROFILE_NOT_FOUND");
    }

    const { WorkoutPlanModel } = await import("@/models/WorkoutPlan");
    await WorkoutPlanModel.updateMany(
      { userId: session.user._id, isActive: true },
      { planMode: body.planMode }
    );

    if (body.restartOnboarding) {
      session.user.onboardingComplete = false;
      await session.user.save();
      await createSessionCookie({
        userId: String(session.user._id),
        email: session.user.email,
        name: session.user.name,
        onboardingComplete: false,
      });
    }

    return ok({
      settings: assembleUserSettings(profile),
      onboardingComplete: session.user.onboardingComplete,
    });
  } catch (error) {
    console.error("[settings:put]", error);
    return fail("Unable to save settings.", 500, "SETTINGS_SAVE_FAILED");
  }
}
