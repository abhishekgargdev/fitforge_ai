import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { generateStructuredVisionJson } from "@/lib/ai/orchestrator";
import { foodImageVisionSystemPrompt, foodImageVisionUserPrompt } from "@/lib/ai/prompts/food-log";
import { foodImageEstimateSchema } from "@/lib/ai/schemas/food-log";
import { recordAiUsage } from "@/lib/ai/usage";

export async function POST(request: Request) {
  let session: Awaited<ReturnType<typeof requireSessionUser>> | null = null;

  try {
    session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");

    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const imageBase64 = typeof body.imageBase64 === "string" ? body.imageBase64.trim() : "";
    const mealCategory = typeof body.mealCategory === "string" ? body.mealCategory : undefined;
    const userContext = typeof body.userContext === "string" ? body.userContext.trim() : undefined;

    if (!imageBase64) {
      return fail("Image data (base64) is required.", 400, "VALIDATION_ERROR");
    }

    if (imageBase64.length > 12_000_000) {
      return fail("Image is too large. Please capture a smaller image or upload a lighter file.", 400, "VALIDATION_ERROR");
    }

    const estimate = await generateStructuredVisionJson({
      system: foodImageVisionSystemPrompt(),
      user: foodImageVisionUserPrompt(mealCategory, userContext),
      imageBase64,
      schema: foodImageEstimateSchema,
    });

    await recordAiUsage({ userId: session.user._id, feature: "nutrition-image", ok: true });

    return ok({ estimate });
  } catch (error) {
    console.error("[ai:food-image-log]", error);
    await recordAiUsage({ userId: session?.user?._id, feature: "nutrition-image", ok: false }).catch(() => undefined);
    return fail("Unable to analyze food image.", 500, "FOOD_IMAGE_LOG_FAILED");
  }
}
