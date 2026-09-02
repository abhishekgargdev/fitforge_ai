import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { persistMeasurement } from "@/lib/progress/persist";
import { toMeasurementDto, toMonthlyMeasurement } from "@/lib/progress/map";
import { measurementCreateSchema, measurementListQuerySchema } from "@/lib/validation/progress";
import { BodyMeasurement } from "@/models/BodyMeasurement";

export async function GET(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const parsed = measurementListQuerySchema.safeParse(
      Object.fromEntries(new URL(request.url).searchParams)
    );
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid query", 400, "VALIDATION_ERROR");
    }
    const { page, limit, from, to } = parsed.data;
    const filter: Record<string, unknown> = { userId: session.user._id };
    if (from || to) {
      filter.date = {
        ...(from ? { $gte: new Date(from) } : {}),
        ...(to ? { $lte: new Date(`${to}T23:59:59.999Z`) } : {}),
      };
    }
    const [rows, total] = await Promise.all([
      BodyMeasurement.find(filter)
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      BodyMeasurement.countDocuments(filter),
    ]);
    return ok({
      items: rows.map(toMeasurementDto),
      monthly: rows.map(toMonthlyMeasurement),
      page,
      limit,
      total,
    });
  } catch (error) {
    console.error("[measurements:list]", error);
    return fail("Unable to load measurements.", 500, "MEASUREMENTS_LOAD_FAILED");
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const parsed = measurementCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input", 400, "VALIDATION_ERROR");
    }
    const created = await persistMeasurement(session.user._id, parsed.data);
    return ok(
      {
        measurement: toMeasurementDto(created),
        monthly: toMonthlyMeasurement(created),
      },
      201
    );
  } catch (error) {
    console.error("[measurements:create]", error);
    return fail("Unable to save measurement.", 500, "MEASUREMENT_CREATE_FAILED");
  }
}
