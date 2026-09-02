import { z } from "zod";

export const exerciseListQuery = z.object({
  q: z.string().trim().max(80).optional().default(""),
  bodyPart: z.string().trim().max(40).optional().default(""),
  equipment: z.string().trim().max(40).optional().default(""),
  target: z.string().trim().max(40).optional().default(""),
  difficulty: z.string().trim().max(20).optional().default(""),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(24),
});
