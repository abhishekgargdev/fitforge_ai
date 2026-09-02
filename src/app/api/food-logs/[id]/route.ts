import mongoose from "mongoose";
import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { foodLogUpdateSchema } from "@/lib/validation/nutrition";
import { toLogDto } from "@/lib/nutrition/map";
import { FoodLogModel } from "@/models/FoodLog";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return fail("Food log not found.", 404, "FOOD_LOG_NOT_FOUND");
    const parsed = foodLogUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input", 400, "VALIDATION_ERROR");
    }
    const log = await FoodLogModel.findOne({ _id: id, userId: session.user._id });
    if (!log) return fail("Food log not found.", 404, "FOOD_LOG_NOT_FOUND");
    const body = parsed.data;
    if (body.name) log.name = body.name;
    if (body.serving) log.serving = body.serving;
    if (body.mealCategory) log.mealCategory = body.mealCategory;
    if (body.caloriesKcal != null) log.caloriesKcal = body.caloriesKcal;
    if (body.proteinGrams != null) log.proteinGrams = body.proteinGrams;
    if (body.carbsGrams != null) log.carbsGrams = body.carbsGrams;
    if (body.fatGrams != null) log.fatGrams = body.fatGrams;
    if (body.fiberGrams != null) log.fiberGrams = body.fiberGrams;
    await log.save();
    return ok({ log: toLogDto(log) });
  } catch (error) {
    console.error("[food-logs:put]", error);
    return fail("Unable to update food log.", 500, "FOOD_LOG_UPDATE_FAILED");
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
    if (!mongoose.isValidObjectId(id)) return fail("Food log not found.", 404, "FOOD_LOG_NOT_FOUND");
    const deleted = await FoodLogModel.findOneAndDelete({
      _id: id,
      userId: session.user._id,
    });
    if (!deleted) return fail("Food log not found.", 404, "FOOD_LOG_NOT_FOUND");
    return ok({ deleted: true });
  } catch (error) {
    console.error("[food-logs:delete]", error);
    return fail("Unable to delete food log.", 500, "FOOD_LOG_DELETE_FAILED");
  }
}
