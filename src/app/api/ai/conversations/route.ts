import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { toChatMessage } from "@/lib/ai/coach";
import { AIConversationModel } from "@/models/AIConversation";

export async function GET() {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const rows = await AIConversationModel.find({ userId: session.user._id })
      .sort({ updatedAt: -1 })
      .limit(30);
    return ok({
      items: rows.map((row) => ({
        id: String(row._id),
        title: row.title,
        updatedAt: row.updatedAt,
        preview: row.messages[row.messages.length - 1]?.text?.slice(0, 80) || "",
        messages: row.messages.map(toChatMessage),
      })),
    });
  } catch (error) {
    console.error("[ai:conversations]", error);
    return fail("Unable to load conversations.", 500, "CONVERSATIONS_LOAD_FAILED");
  }
}
