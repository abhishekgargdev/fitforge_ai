import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { compareMeasurements } from "@/lib/progress/series";
import { measurementCompareQuerySchema } from "@/lib/validation/progress";
import { BodyMeasurement } from "@/models/BodyMeasurement";

export async function GET(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const parsed = measurementCompareQuerySchema.safeParse(
      Object.fromEntries(new URL(request.url).searchParams)
    );
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid query", 400, "VALIDATION_ERROR");
    }
    let a;
    let b;
    if (parsed.data.a && parsed.data.b) {
      [a, b] = await Promise.all([
        BodyMeasurement.findOne({ _id: parsed.data.a, userId: session.user._id }),
        BodyMeasurement.findOne({ _id: parsed.data.b, userId: session.user._id }),
      ]);
    } else {
      const latestTwo = await BodyMeasurement.find({ userId: session.user._id })
        .sort({ date: -1 })
        .limit(2);
      a = latestTwo[1] || latestTwo[0];
      b = latestTwo[0];
    }
    if (!a || !b) return fail("Need two measurements to compare.", 404, "COMPARE_NOT_FOUND");
    return ok(compareMeasurements(a, b));
  } catch (error) {
    console.error("[measurements:compare]", error);
    return fail("Unable to compare measurements.", 500, "MEASUREMENT_COMPARE_FAILED");
  }
}
