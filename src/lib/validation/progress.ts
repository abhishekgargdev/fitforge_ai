import { z } from "zod";
import { objectIdString, paginationQuery } from "@/lib/validation/base";

export const progressRangeSchema = z.enum(["1m", "3m", "6m", "1y", "all"]);
export const progressMetricSchema = z.enum([
  "weight",
  "fat",
  "muscle",
  "bmi",
  "bodyAge",
  "visceralFat",
  "restingMetabolism",
]);

const optionalNumber = z.number().min(0).max(500).optional();

export const measurementCreateSchema = z.object({
  date: z.string().optional(),
  month: z.string().max(40).optional(),
  weightKg: z.number().min(30).max(300).optional(),
  bodyFatPercentage: z.number().min(3).max(60).optional(),
  muscleMassKg: z.number().min(10).max(120).optional(),
  bmi: z.number().min(10).max(60).optional(),
  measuredBmi: z.number().min(10).max(60).optional(),
  visceralFat: z.number().min(0).max(30).optional(),
  bodyAge: z.number().int().min(10).max(90).optional(),
  trunkFatPercentage: optionalNumber,
  trunkMusclePercentage: optionalNumber,
  armsFatPercentage: optionalNumber,
  armsMusclePercentage: optionalNumber,
  legsFatPercentage: optionalNumber,
  legsMusclePercentage: optionalNumber,
  chestCm: optionalNumber,
  waistCm: optionalNumber,
  hipsCm: optionalNumber,
  bicepsCm: optionalNumber,
  thighsCm: optionalNumber,
  calvesCm: optionalNumber,
  shouldersCm: optionalNumber,
  neckCm: optionalNumber,
});

export const measurementUpdateSchema = measurementCreateSchema;

export const measurementListQuerySchema = paginationQuery.extend({
  from: z.string().optional(),
  to: z.string().optional(),
});

export const measurementCompareQuerySchema = z.object({
  a: objectIdString.optional(),
  b: objectIdString.optional(),
});

export const progressQuerySchema = z.object({
  metric: progressMetricSchema.optional().default("weight"),
  range: progressRangeSchema.optional().default("3m"),
});

export const progressSummaryQuerySchema = z.object({
  range: progressRangeSchema.optional().default("3m"),
});

export const aiProgressAnalysisInputSchema = z.object({
  range: progressRangeSchema.optional().default("3m"),
});
