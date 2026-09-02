import { z } from "zod";
import { objectIdString, paginationQuery } from "./base";

export const notificationListQuery = paginationQuery.extend({
  unreadOnly: z
    .string()
    .optional()
    .transform((val) => val === "true" || val === "1"),
});

export const notificationIdParam = z.object({
  id: objectIdString,
});
