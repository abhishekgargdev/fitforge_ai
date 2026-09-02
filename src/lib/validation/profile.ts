import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(80),
  age: z.number().int().min(15).max(90),
  gender: z.enum(["male", "female", "other"]),
  heightCm: z.number().min(120).max(230),
  weightKg: z.number().min(35).max(200),
  bodyFatPercentage: z.number().min(3).max(60),
});

export const updateSettingsSchema = z.object({
  unitSystem: z.enum(["metric", "imperial"]),
  theme: z.enum(["dark", "light", "system"]),
  aiPersona: z.enum(["scientific", "motivational", "strict"]),
  audioChimes: z.boolean(),
  restartOnboarding: z.boolean().optional(),
});
