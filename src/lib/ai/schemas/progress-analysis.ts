import { z } from "zod";

export const progressAnalysisSchema = z.object({
  executiveSummary: z.string().min(1).max(1200),
  recompositionStatus: z.string().min(1).max(80),
  strengths: z.array(z.string().min(1)).min(1).max(6),
  areasToOptimize: z.array(z.string().min(1)).min(1).max(6),
  upcomingPhaseRecommendation: z.string().min(1).max(800),
});

export type ProgressAnalysis = z.infer<typeof progressAnalysisSchema>;
