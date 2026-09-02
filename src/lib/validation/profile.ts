import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(80),
  age: z.number().int().min(15).max(90),
  gender: z.enum(["male", "female", "other"]),
  heightCm: z.number().min(120).max(230),
  weightKg: z.number().min(35).max(200),
  targetWeightKg: z.number().min(35).max(200).optional(),
  bodyFatPercentage: z.number().min(3).max(60),
  fitnessGoal: z.enum(["lose_fat", "build_muscle", "maintain", "improve_fitness", "strength", "general_health"]).optional(),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  trainingDays: z.array(z.string()).optional(),
  trainingDaysPerWeek: z.number().int().min(2).max(7).optional(),
  workoutDurationMinutes: z.number().int().min(15).max(180).optional(),
  availableEquipment: z.array(z.string()).optional(),
  focusMuscles: z.array(z.string()).optional(),
  dietPreference: z.enum(["non_vegetarian", "vegetarian", "vegan", "pescatarian", "keto", "other"]).optional(),
  mealsPerDay: z.number().int().min(1).max(8).optional(),
  foodPreferences: z.string().max(500).optional(),
  allergies: z.string().max(500).optional(),
});

export const updateSettingsSchema = z.object({
  unitSystem: z.enum(["metric", "imperial"]),
  theme: z.enum(["dark", "light", "system"]),
  aiPersona: z.enum(["scientific", "motivational", "strict"]),
  audioChimes: z.boolean(),
  planMode: z.enum(["ai", "manual"]).optional().default("ai"),
  restartOnboarding: z.boolean().optional(),
});
