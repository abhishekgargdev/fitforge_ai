import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { cacheOffBarcode, toFoodDto } from "@/lib/nutrition/cache";

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const { code } = await context.params;
    const food = await cacheOffBarcode(code.trim());
    if (!food) return fail("Barcode not found.", 404, "BARCODE_NOT_FOUND");
    return ok({ food: toFoodDto(food) });
  } catch (error) {
    console.error("[foods:barcode]", error);
    return fail("Unable to look up barcode.", 500, "BARCODE_LOOKUP_FAILED");
  }
}
