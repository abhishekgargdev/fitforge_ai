import mongoose from "mongoose";
import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { toChatMessage } from "@/lib/ai/coach";
import { AIConversationModel } from "@/models/AIConversation";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) {
      return fail("Conversation not found.", 404, "CONVERSATION_NOT_FOUND");
    }
    const row = await AIConversationModel.findOne({ _id: id, userId: session.user._id });
    if (!row) return fail("Conversation not found.", 404, "CONVERSATION_NOT_FOUND");
    return ok({
      id: String(row._id),
      title: row.title,
      messages: row.messages.map(toChatMessage),
    });
  } catch (error) {
    console.error("[ai:conversations:get]", error);
    return fail("Unable to load conversation.", 500, "CONVERSATION_LOAD_FAILED");
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
      return fail("Conversation not found.", 404, "CONVERSATION_NOT_FOUND");
    }
    const deleted = await AIConversationModel.findOneAndDelete({
      _id: id,
      userId: session.user._id,
    });
    if (!deleted) return fail("Conversation not found.", 404, "CONVERSATION_NOT_FOUND");
    return ok({ deleted: true });
  } catch (error) {
    console.error("[ai:conversations:delete]", error);
    return fail("Unable to delete conversation.", 500, "CONVERSATION_DELETE_FAILED");
  }
}
