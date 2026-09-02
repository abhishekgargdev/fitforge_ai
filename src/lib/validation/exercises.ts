import { z } from "zod";

export const exerciseListQuery = z.object({
  q: z.string().trim().max(80).optional().default(""),
  bodyPart: z.string().trim().max(40).optional().default(""),
  bodyParts: z.string().trim().max(100).optional().default(""),
  equipment: z.string().trim().max(40).optional().default(""),
  equipments: z.string().trim().max(100).optional().default(""),
  target: z.string().trim().max(40).optional().default(""),
  targetMuscles: z.string().trim().max(100).optional().default(""),
  difficulty: z.string().trim().max(20).optional().default(""),
  source: z.enum(["all", "catalog", "user"]).optional().default("all"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(24),
});

export const createExerciseSchema = z.object({
  name: z.string().trim().min(2).max(100),
  bodyParts: z.array(z.string().trim().min(1)).min(1),
  equipments: z.array(z.string().trim().min(1)).min(1),
  targetMuscles: z.array(z.string().trim().min(1)).min(1),
  secondaryMuscles: z.array(z.string().trim()).optional().default([]),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional().default("Intermediate"),
  exerciseType: z.enum(["Strength", "Hypertrophy", "Cardio", "Mobility"]).optional().default("Strength"),
  gifUrl: z.string().trim().url(),
  instructions: z.array(z.string().trim().min(1)).min(1),
  cloudinaryPublicId: z.string().optional(),
});
