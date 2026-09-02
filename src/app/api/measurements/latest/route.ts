import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { toComposition, toMeasurementDto, toMonthlyMeasurement } from "@/lib/progress/map";
import { BodyMeasurement } from "@/models/BodyMeasurement";

export async function GET() {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const [latest, previous] = await Promise.all([
      BodyMeasurement.findOne({ userId: session.user._id }).sort({ date: -1 }),
      BodyMeasurement.find({ userId: session.user._id }).sort({ date: -1 }).skip(1).limit(1),
    ]);
    if (!latest) return fail("No measurements found.", 404, "MEASUREMENT_NOT_FOUND");
    const prior = previous[0] || null;
    return ok({
      measurement: toMeasurementDto(latest),
      monthly: toMonthlyMeasurement(latest),
      composition: toComposition(latest),
      previousComposition: prior ? toComposition(prior) : null,
    });
  } catch (error) {
    console.error("[measurements:latest]", error);
    return fail("Unable to load latest measurement.", 500, "MEASUREMENT_LATEST_FAILED");
  }
}
