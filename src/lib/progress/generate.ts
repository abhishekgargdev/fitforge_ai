import { generateStructuredJson } from "@/lib/ai/orchestrator";
import {
  progressAnalysisSystemPrompt,
  progressAnalysisUserPrompt,
} from "@/lib/ai/prompts/progress-analysis";
import { progressAnalysisSchema } from "@/lib/ai/schemas/progress-analysis";
import { bmi } from "@/lib/calculations";
import { buildProgressSummary, measurementsInRange } from "@/lib/progress/series";
import type { ProgressRange } from "@/lib/progress/types";
import { FitnessGoalModel } from "@/models/FitnessGoal";
import { Profile } from "@/models/Profile";

export async function generateProgressAnalysis(userId: unknown, range: ProgressRange) {
  const [rows, profile, goal] = await Promise.all([
    measurementsInRange(userId, range),
    Profile.findOne({ userId }),
    FitnessGoalModel.findOne({ userId }),
  ]);
  if (rows.length === 0) {
    throw new Error("No measurements available");
  }

  const summary = buildProgressSummary(rows);
  const latestBmi =
    profile && summary.composition.overall.weightKg
      ? bmi(summary.composition.overall.weightKg, profile.heightCm)
      : summary.composition.overall.bmi;
  const caution =
    latestBmi >= 35 || summary.composition.overall.bodyFatPercentage >= 40
      ? "Body metrics look concerning. Do not diagnose. Suggest seeing a healthcare professional."
      : latestBmi > 0 && latestBmi < 17
        ? "BMI is low. Do not diagnose. Suggest seeing a healthcare professional."
        : "";

  const proposed = await generateStructuredJson({
    system: progressAnalysisSystemPrompt(),
    user: progressAnalysisUserPrompt({
      goal: goal?.fitnessGoal || "general_health",
      chronologicalAge: profile?.age || 0,
      range,
      recompScore: summary.recompScore,
      trendsJson: JSON.stringify({
        metrics: summary.metrics,
        waist: summary.waist,
        composition: summary.composition,
        previousComposition: summary.previousComposition,
      }),
      caution,
    }),
    schema: progressAnalysisSchema,
  });

  return {
    ...proposed,
    recompScore: `${summary.recompScore} / 100`,
    range,
  };
}
