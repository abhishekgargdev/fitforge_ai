import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { generateProgressAnalysis } from "@/lib/progress/generate";
import { aiProgressAnalysisInputSchema } from "@/lib/validation/progress";

export async function POST(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    let json = {};
    try {
      json = await request.json();
    } catch {
      json = {};
    }
    const parsed = aiProgressAnalysisInputSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input", 400, "VALIDATION_ERROR");
    }
    const analysis = await generateProgressAnalysis(session.user._id, parsed.data.range);
    return ok(analysis);
  } catch (error) {
    console.error("[ai:progress-analysis]", error);
    return fail("Unable to generate a progress analysis right now.", 500, "AI_PROGRESS_ANALYSIS_FAILED");
  }
}
