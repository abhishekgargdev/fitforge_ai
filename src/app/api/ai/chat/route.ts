import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { generateCoachReply } from "@/lib/ai/coach";
import { coachChatInputSchema } from "@/lib/validation/coach";

export async function POST(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const parsed = coachChatInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input", 400, "VALIDATION_ERROR");
    }
    const result = await generateCoachReply({
      userId: session.user._id,
      conversationId: parsed.data.conversationId,
      message: parsed.data.message,
    });
    return ok(result);
  } catch (error) {
    console.error("[ai:chat]", error);
    return fail("Unable to reply right now.", 500, "AI_CHAT_FAILED");
  }
}
