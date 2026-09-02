import { generateStructuredJson } from "@/lib/ai/orchestrator";
import { coachSystemPrompt, coachUserPrompt } from "@/lib/ai/prompts/coach";
import { coachReplySchema } from "@/lib/ai/schemas/coach";
import { recordAiUsage } from "@/lib/ai/usage";
import { coachContextFromDashboard, getDashboardData } from "@/lib/dashboard/compose";
import { AIConversationModel } from "@/models/AIConversation";
import type { AIChatMessage } from "@/types";

export function toChatMessage(doc: {
  _id?: { toString(): string };
  role: "user" | "assistant";
  text: string;
  origin?: AIChatMessage["dataOrigin"];
  createdAt?: Date;
}): AIChatMessage {
  return {
    id: doc._id ? String(doc._id) : `msg-${doc.createdAt?.getTime() || Date.now()}`,
    sender: doc.role === "user" ? "user" : "ai",
    text: doc.text,
    timestamp: (doc.createdAt || new Date()).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    dataOrigin: doc.role === "assistant" ? doc.origin || "AI_RECOMMENDATION" : undefined,
  };
}

export async function generateCoachReply(input: {
  userId: unknown;
  conversationId?: string;
  message: string;
}) {
  let conversation = input.conversationId
    ? await AIConversationModel.findOne({ _id: input.conversationId, userId: input.userId })
    : await AIConversationModel.findOne({ userId: input.userId }).sort({ updatedAt: -1 });

  if (!conversation) {
    conversation = await AIConversationModel.create({
      userId: input.userId,
      title: input.message.slice(0, 60),
      messages: [],
    });
  }

  conversation.messages.push({
    role: "user",
    text: input.message,
    createdAt: new Date(),
  });

  const history = conversation.messages
    .slice(-16)
    .map((row: { role: string; text: string }) => `${row.role}: ${row.text}`)
    .join("\n");

  const dashboard = await getDashboardData(input.userId);
  const contextJson = JSON.stringify(coachContextFromDashboard(dashboard));

  try {
    const proposed = await generateStructuredJson({
      system: coachSystemPrompt(),
      user: coachUserPrompt({
        message: input.message,
        history,
        contextJson,
      }),
      schema: coachReplySchema,
    });
    await recordAiUsage({ userId: input.userId, feature: "chat", ok: true });

    conversation.messages.push({
      role: "assistant",
      text: proposed.reply,
      origin: "AI_RECOMMENDATION",
      createdAt: new Date(),
    });
    if (!conversation.title || conversation.title === "Coach chat") {
      conversation.title = input.message.slice(0, 60);
    }
    await conversation.save();

    const last = conversation.messages[conversation.messages.length - 1];
    return {
      conversationId: String(conversation._id),
      message: toChatMessage(last),
      suggestedPrompts: proposed.suggestedPrompts || [],
    };
  } catch (error) {
    await recordAiUsage({ userId: input.userId, feature: "chat", ok: false });
    throw error;
  }
}
