import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongodb";
import { fail, ok } from "@/lib/api/response";
import { onboardingSchema } from "@/lib/validation/auth";
import { createSessionCookie, readSessionToken } from "@/lib/auth/session";
import { bmi } from "@/lib/calculations";
import { BodyMeasurement } from "@/models/BodyMeasurement";
import { FitnessGoalModel } from "@/models/FitnessGoal";
import { Profile } from "@/models/Profile";
import { User } from "@/models/User";

export async function POST(request: Request) {
  try {
    const token = await readSessionToken();
    if (!token) {
      return fail("Unauthorized", 401, "UNAUTHORIZED");
    }

    const json = await request.json();
    const parsed = onboardingSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input", 400, "VALIDATION_ERROR");
    }

    await connectDB();
    const user = await User.findById(token.userId);
    if (!user) {
      return fail("Unauthorized", 401, "UNAUTHORIZED");
    }
    if (user.onboardingComplete) {
      return fail("Onboarding is already complete.", 409, "ALREADY_ONBOARDED");
    }

    const body = parsed.data;
    const calculatedBmi = bmi(body.weightKg, body.heightCm);
    const userId = user._id;

    const persist = async (session?: mongoose.ClientSession) => {
      const writeOpts = session
        ? { session, upsert: true, returnDocument: "after" as const }
        : { upsert: true, returnDocument: "after" as const };

      await Profile.findOneAndUpdate(
        { userId },
        {
          userId,
          age: body.age,
          gender: body.gender,
          heightCm: body.heightCm,
          weightKg: body.weightKg,
          bodyFatPercentage: body.bodyFatPercentage,
          dietPreference: body.dietPreference,
          mealsPerDay: body.mealsPerDay,
          foodPreferences: body.foodPreferences ?? "",
          allergies: body.allergies ?? "",
          unitSystem: "metric",
          theme: "dark",
        },
        writeOpts
      );

      await FitnessGoalModel.findOneAndUpdate(
        { userId },
        {
          userId,
          fitnessGoal: body.fitnessGoal,
          targetWeightKg: body.targetWeightKg,
          focusMuscles: body.focusMuscles,
          experienceLevel: body.experienceLevel,
          trainingDaysPerWeek: body.trainingDaysPerWeek,
          workoutDurationMinutes: body.workoutDurationMinutes,
          availableEquipment: body.availableEquipment,
        },
        writeOpts
      );

      await BodyMeasurement.findOneAndUpdate(
        { userId },
        {
          userId,
          date: new Date(),
          weightKg: body.weightKg,
          bodyFatPercentage: body.bodyFatPercentage,
          bmi: calculatedBmi,
          origin: "MEASURED",
        },
        writeOpts
      );

      await User.findByIdAndUpdate(
        userId,
        { name: body.name, onboardingComplete: true },
        session ? { session } : undefined
      );
    };

    const topologyType = (
      mongoose.connection as unknown as {
        client?: { topology?: { description?: { type?: string } } };
      }
    ).client?.topology?.description?.type;
    const canUseTransactions =
      topologyType === "ReplicaSetWithPrimary" ||
      topologyType === "Sharded" ||
      topologyType === "LoadBalanced";

    if (canUseTransactions) {
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          await persist(session);
        });
      } finally {
        await session.endSession();
      }
    } else {
      await persist();
    }

    await createSessionCookie({
      userId: String(user._id),
      email: user.email,
      name: body.name,
      onboardingComplete: true,
    });

    return ok({
      onboardingComplete: true,
      bmi: calculatedBmi,
    });
  } catch (error) {
    console.error("[onboarding]", error);
    return fail("Unable to save onboarding.", 500, "ONBOARDING_FAILED");
  }
}
