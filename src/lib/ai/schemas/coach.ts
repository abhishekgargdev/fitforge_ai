import { z } from "zod";

export const coachReplySchema = z.object({
  reply: z.string().min(1).max(2500),
  suggestedPrompts: z.array(z.string().min(1).max(120)).max(4).optional().default([]),
});

export type CoachReply = z.infer<typeof coachReplySchema>;
