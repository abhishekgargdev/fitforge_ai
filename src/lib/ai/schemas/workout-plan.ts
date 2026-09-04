import { z } from "zod";

export const aiWorkoutExerciseSchema = z.object({
  name: z.string().min(1),
  sets: z.number().int().min(1).max(8),
  reps: z.coerce.string().min(1),
  restSeconds: z.number().int().min(15).max(300),
  aiNote: z.string().max(240).optional().default(""),
  phase: z.enum(["warmup", "cardio", "bodyweight", "main", "cooldown"]).optional().default("main"),
  trackingType: z.enum(["reps", "timer"]).optional().default("reps"),
  targetDurationSeconds: z.number().int().optional().default(0),
  isStretchFallback: z.boolean().optional().default(false),
  stretchInstructions: z.array(z.string()).optional().default([]),
});

export const aiWorkoutDaySchema = z.object({
  dayName: z.string().min(1),
  focus: z.string().min(1),
  isRestDay: z.boolean(),
  intensityLevel: z.enum(["light", "moderate", "hard"]).optional().default("moderate"),
  workout: z
    .object({
      name: z.string().min(1),
      durationMinutes: z.number().int().min(15).max(180),
      muscleGroups: z.array(z.string()).default([]),
      exercises: z.array(aiWorkoutExerciseSchema).default([]),
    })
    .optional(),
});

export const aiWorkoutPlanSchema = z.object({
  planTitle: z.string().min(1).max(120),
  daysPerWeek: z.number().int().min(2).max(7),
  days: z.array(aiWorkoutDaySchema).min(5).max(7),
});

export type AiWorkoutPlan = z.infer<typeof aiWorkoutPlanSchema>;
