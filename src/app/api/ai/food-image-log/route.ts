import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { generateStructuredVisionJson } from "@/lib/ai/orchestrator";
import { foodImageVisionSystemPrompt, foodImageVisionUserPrompt } from "@/lib/ai/prompts/food-log";
import { foodImageEstimateSchema } from "@/lib/ai/schemas/food-log";
import { recordAiUsage } from "@/lib/ai/usage";

export async function POST(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");

    const json = await request.json();
    const { imageBase64, mealCategory } = json;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return fail("Image data (base64) is required.", 400, "VALIDATION_ERROR");
    }

    // Call orchestrator with NVIDIA vision model (meta/llama-3.2-11b-vision-instruct)
    const estimate = await generateStructuredVisionJson({
      system: foodImageVisionSystemPrompt(),
      user: foodImageVisionUserPrompt(mealCategory),
      imageBase64,
      schema: foodImageEstimateSchema,
    });

    await recordAiUsage({ userId: session.user._id, feature: "nutrition-image", ok: true });

    return ok({ estimate });
  } catch (error) {
    console.error("[ai:food-image-log]", error);
    await recordAiUsage({ userId: "system", feature: "nutrition-image", ok: false }).catch(() => undefined);
    return fail("Unable to analyze food image.", 500, "FOOD_IMAGE_LOG_FAILED");
  }
}
