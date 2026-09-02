import { z } from "zod";

export const objectIdString = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid id");

export const isoDateString = z.string().min(1);

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
