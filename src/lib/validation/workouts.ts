import { z } from "zod";

export const plannerInputSchema = z.object({
  goal: z.string().min(1),
  daysPerWeek: z.number().int().min(2).max(7),
  trainingDays: z.array(z.string()).optional(),
  duration: z.number().int().min(20).max(180),
  experience: z.string().min(1),
  equipment: z.array(z.string()).min(1),
  focusMuscles: z.array(z.string()).min(1),
  preferences: z.string().max(400).optional().default(""),
});

export const startWorkoutSchema = z.object({
  workoutPlanId: z.string().min(1),
  dayIndex: z.number().int().min(0).max(6),
  startWeightKg: z.number().positive().optional(),
});

export const updateSessionSchema = z.object({
  exercises: z.array(
    z.object({
      exerciseId: z.string().min(1),
      restSeconds: z.number().int().min(15).max(300).optional(),
      aiNote: z.string().optional(),
      sets: z.array(
        z.object({
          setNumber: z.number().int().min(1),
          targetWeightKg: z.number().min(0),
          targetReps: z.number().int().min(0),
          actualWeightKg: z.number().min(0),
          actualReps: z.number().int().min(0),
          rpe: z.number().min(1).max(10).optional(),
          completed: z.boolean(),
        })
      ),
    })
  ),
  durationMinutes: z.number().int().min(1).max(240).optional(),
  endWeightKg: z.number().positive().optional(),
});
