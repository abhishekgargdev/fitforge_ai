import mongoose from "mongoose";
import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { persistMeasurement } from "@/lib/progress/persist";
import { toMeasurementDto, toMonthlyMeasurement } from "@/lib/progress/map";
import { measurementUpdateSchema } from "@/lib/validation/progress";
import { BodyMeasurement } from "@/models/BodyMeasurement";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) {
      return fail("Measurement not found.", 404, "MEASUREMENT_NOT_FOUND");
    }
    const row = await BodyMeasurement.findOne({ _id: id, userId: session.user._id });
    if (!row) return fail("Measurement not found.", 404, "MEASUREMENT_NOT_FOUND");
    return ok({
      measurement: toMeasurementDto(row),
      monthly: toMonthlyMeasurement(row),
    });
  } catch (error) {
    console.error("[measurements:get]", error);
    return fail("Unable to load measurement.", 500, "MEASUREMENT_LOAD_FAILED");
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) {
      return fail("Measurement not found.", 404, "MEASUREMENT_NOT_FOUND");
    }
    const parsed = measurementUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input", 400, "VALIDATION_ERROR");
    }
    const updated = await persistMeasurement(session.user._id, parsed.data, id);
    if (!updated) return fail("Measurement not found.", 404, "MEASUREMENT_NOT_FOUND");
    return ok({
      measurement: toMeasurementDto(updated),
      monthly: toMonthlyMeasurement(updated),
    });
  } catch (error) {
    console.error("[measurements:put]", error);
    return fail("Unable to update measurement.", 500, "MEASUREMENT_UPDATE_FAILED");
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) {
      return fail("Measurement not found.", 404, "MEASUREMENT_NOT_FOUND");
    }
    const deleted = await BodyMeasurement.findOneAndDelete({
      _id: id,
      userId: session.user._id,
    });
    if (!deleted) return fail("Measurement not found.", 404, "MEASUREMENT_NOT_FOUND");
    return ok({ deleted: true });
  } catch (error) {
    console.error("[measurements:delete]", error);
    return fail("Unable to delete measurement.", 500, "MEASUREMENT_DELETE_FAILED");
  }
}
