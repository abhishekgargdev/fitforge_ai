import { z } from "zod";

const fitnessGoal = z.enum([
  "lose_fat",
  "build_muscle",
  "maintain",
  "improve_fitness",
  "strength",
  "general_health",
] as const);

const experienceLevel = z.enum([
  "beginner",
  "intermediate",
  "advanced",
] as const);

const equipmentType = z.enum([
  "full_gym",
  "dumbbells",
  "barbell",
  "machines",
  "resistance_bands",
  "bodyweight",
  "home_gym",
] as const);

const dietPreference = z.enum([
  "non_vegetarian",
  "vegetarian",
  "vegan",
  "pescatarian",
  "keto",
  "other",
] as const);

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6).max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(16),
  password: z.string().min(6).max(128),
});

export const onboardingSchema = z.object({
  name: z.string().trim().min(1).max(80),
  age: z.number().int().min(15).max(90),
  gender: z.enum(["male", "female", "other"]),
  heightCm: z.number().min(120).max(230),
  weightKg: z.number().min(35).max(200),
  targetWeightKg: z.number().min(35).max(200),
  bodyFatPercentage: z.number().min(3).max(60),
  fitnessGoal,
  focusMuscles: z.array(z.string().min(1)).min(1),
  experienceLevel,
  trainingDaysPerWeek: z.number().int().min(2).max(7),
  trainingDays: z.array(z.string()).optional(),
  workoutDurationMinutes: z.number().int().min(20).max(180),
  availableEquipment: z.array(equipmentType).min(1),
  dietPreference,
  mealsPerDay: z.number().int().min(2).max(8),
  foodPreferences: z.string().max(500).optional().default(""),
  allergies: z.string().max(300).optional().default(""),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
