import { z } from "zod";

export const recoveryItemSchema = z.object({
  type: z.enum([
    "shower",
    "stretch",
    "mobility",
    "supplement",
    "meditation",
    "sleep",
    "hydration",
  ]),
  title: z.string(),
  description: z.string(),
});

export const recoveryPlanSchema = z.object({
  recommendationSummary: z.string(),
  items: z.array(recoveryItemSchema).min(3).max(7),
});

export type AIRecoveryPlanOutput = z.infer<typeof recoveryPlanSchema>;
