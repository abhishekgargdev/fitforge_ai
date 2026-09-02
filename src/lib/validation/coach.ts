import { z } from "zod";
import { objectIdString } from "@/lib/validation/base";

export const coachChatInputSchema = z.object({
  conversationId: objectIdString.optional(),
  message: z.string().trim().min(1).max(2000),
});
