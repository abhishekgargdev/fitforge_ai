import { fail, ok } from "@/lib/api/response";
import { connectDB } from "@/lib/db/mongodb";
import { generateAndSaveWorkoutPlan, type PlannerInput } from "@/lib/workouts/generate";
import { FitnessGoalModel } from "@/models/FitnessGoal";
import { WorkoutPlanModel } from "@/models/WorkoutPlan";

export const maxDuration = 60; // Vercel function execution limit (seconds)

// ARCHITECTURE NOTE:
// Because renewal dates are naturally spread across the week (each user renews 7 days
// after their own last plan generation), a single daily cron run only processes ~1/7th
// of the active AI user base. If the user base later outgrows what one daily invocation
// can process within Vercel function timeout limits, the next step is a dedicated background
// queue (e.g., Upstash QStash) rather than running cron more frequently on Vercel's free tier.

function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    // In dev mode without CRON_SECRET configured, allow execution for testing
    return process.env.NODE_ENV !== "production";
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
  const customHeader = request.headers.get("x-cron-secret");
  return token === cronSecret || customHeader === cronSecret;
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}

async function handleCron(request: Request) {
  if (!isAuthorized(request)) {
    return fail("Unauthorized cron request", 401, "UNAUTHORIZED");
  }

  try {
    await connectDB();
    const now = new Date();

    // Query active plans due for auto-regeneration (planMode == 'ai' and nextPlanGenerationDate <= today)
    const duePlans = await WorkoutPlanModel.find({
      isActive: true,
      planMode: "ai",
      $or: [
        { nextPlanGenerationDate: { $lte: now } },
        { nextPlanGenerationDate: { $exists: false } },
      ],
    }).limit(50); // Bounded query safety cap per invocation

    const results = {
      processedCount: 0,
      successCount: 0,
      failureCount: 0,
      failures: [] as Array<{ userId: string; error: string }>,
    };

    const CONCURRENCY = 3;
    for (let i = 0; i < duePlans.length; i += CONCURRENCY) {
      const chunk = duePlans.slice(i, i + CONCURRENCY);
      await Promise.all(
        chunk.map(async (planDoc) => {
          results.processedCount++;
          const userIdStr = String(planDoc.userId);
          try {
            const goalDoc = await FitnessGoalModel.findOne({ userId: planDoc.userId });
            const existingInputs = planDoc.plannerInputs;

            const input: PlannerInput = {
              goal: goalDoc?.fitnessGoal || existingInputs?.goal || "build_muscle",
              daysPerWeek: goalDoc?.trainingDaysPerWeek || existingInputs?.daysPerWeek || planDoc.daysPerWeek || 4,
              duration: goalDoc?.workoutDurationMinutes || existingInputs?.duration || 60,
              experience: goalDoc?.experienceLevel || existingInputs?.experience || "intermediate",
              equipment: goalDoc?.availableEquipment?.length
                ? goalDoc.availableEquipment
                : existingInputs?.equipment || ["full_gym"],
              focusMuscles: goalDoc?.focusMuscles?.length
                ? goalDoc.focusMuscles
                : existingInputs?.focusMuscles || ["Chest", "Back"],
              preferences: existingInputs?.preferences || "Weekly automated refresh",
            };

            await generateAndSaveWorkoutPlan(planDoc.userId, input);
            results.successCount++;
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Unknown error during plan generation";
            console.error(`[cron:generate-weekly-plans] Failed for user ${userIdStr}:`, errorMsg);
            results.failureCount++;
            results.failures.push({ userId: userIdStr, error: errorMsg });

            // Push nextPlanGenerationDate forward by 1 day on failure so we don't retry endlessly in loop
            await WorkoutPlanModel.updateOne(
              { _id: planDoc._id },
              { nextPlanGenerationDate: new Date(Date.now() + 24 * 60 * 60 * 1000) }
            );
          }
        })
      );
    }

    return ok({ message: "Weekly plan generation cron completed.", ...results });
  } catch (error) {
    console.error("[cron:generate-weekly-plans]", error);
    return fail("Cron execution failed", 500, "CRON_FAILED");
  }
}
