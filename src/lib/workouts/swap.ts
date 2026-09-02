import { z } from "zod";
import { generateStructuredJson } from "@/lib/ai/orchestrator";
import { connectDB } from "@/lib/db/mongodb";
import { toExerciseDto } from "@/lib/exercises/map";
import { ExerciseModel } from "@/models/Exercise";
import type { Exercise } from "@/types";

const swapResponseSchema = z.object({
  proposedExerciseName: z.string().min(1),
  reasoning: z.string().optional().default("Biomechanically equivalent alternative movement"),
});

export type SwapExerciseResult = {
  exerciseDoc: any;
  exerciseDto: Exercise;
  reasoning: string;
};

export async function swapExerciseWithAi(params: {
  originalExerciseName: string;
  targetMuscle: string;
  bodyParts?: string[];
  equipment?: string;
  reason?: string;
  excludeEquipment?: string[];
  userEquipment?: string[];
  existingDayExerciseNames?: string[];
}): Promise<SwapExerciseResult> {
  await connectDB();

  const target = params.targetMuscle || "General";
  const bodyPartsStr = params.bodyParts?.length ? params.bodyParts.join(", ") : target;
  const excludeStr = params.excludeEquipment?.length ? params.excludeEquipment.join(", ") : "None";
  const userEqStr = params.userEquipment?.length ? params.userEquipment.join(", ") : "Dumbbell, Barbell, Cable, Machine, Bodyweight";
  const existingStr = params.existingDayExerciseNames?.length ? params.existingDayExerciseNames.join(", ") : "None";
  const reasonStr = params.reason || "User requested alternative exercise";

  const system = `You are FitForge AI's expert biomechanics and strength coach. 
Suggest a single alternative exercise to replace "${params.originalExerciseName}".
Rules:
1. Target muscle/biomechanics MUST closely match: ${target} (${bodyPartsStr}).
2. Do NOT use excluded equipment: ${excludeStr}.
3. Only use available equipment: ${userEqStr}.
4. Do NOT pick any exercise already performed today: ${existingStr}.
5. Return JSON format strictly matching schema with "proposedExerciseName" and "reasoning".`;

  const user = `Original Exercise: ${params.originalExerciseName}
Target Muscle: ${target}
User Reason for Swap: ${reasonStr}
Exclude Equipment: ${excludeStr}
Available Equipment: ${userEqStr}

Propose the single best alternative exercise movement by exact name.`;

  let proposedName = "";
  let reasoning = "";

  try {
    const response = await generateStructuredJson({
      system,
      user,
      schema: swapResponseSchema,
    });
    proposedName = response.proposedExerciseName;
    reasoning = response.reasoning;
  } catch (err) {
    console.warn("[swapExerciseWithAi] AI orchestrator fallback triggered:", err);
  }

  // Attempt 1: Find by exact / regex AI proposed name
  let matchedDoc: any = null;
  if (proposedName) {
    matchedDoc = await ExerciseModel.findOne({
      name: { $regex: new RegExp(`^${proposedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    });
    if (!matchedDoc) {
      matchedDoc = await ExerciseModel.findOne({
        name: { $regex: proposedName, $options: "i" },
      });
    }
  }

  // Attempt 2: Fallback query matching targetMuscles or bodyParts excluding equipment & existing names
  if (!matchedDoc) {
    const filter: Record<string, unknown> = {
      name: { $ne: params.originalExerciseName },
    };

    if (params.existingDayExerciseNames?.length) {
      filter.name = { $nin: [params.originalExerciseName, ...params.existingDayExerciseNames] };
    }

    if (params.excludeEquipment?.length) {
      const regexes = params.excludeEquipment.map((eq) => new RegExp(eq, "i"));
      filter.equipments = { $nin: regexes };
    }

    // Try target muscle match
    filter.$or = [
      { targetMuscles: { $regex: target, $options: "i" } },
      { bodyParts: { $regex: target, $options: "i" } },
      { primaryMuscles: { $regex: target, $options: "i" } },
    ];

    matchedDoc = await ExerciseModel.findOne(filter).sort({ createdAt: -1, name: 1 });
  }

  // Attempt 3: Any alternative exercise
  if (!matchedDoc) {
    matchedDoc = await ExerciseModel.findOne({ name: { $ne: params.originalExerciseName } });
  }

  if (!matchedDoc) {
    throw new Error("No alternative exercise found in collection.");
  }

  if (!reasoning) {
    reasoning = `Replaced ${params.originalExerciseName} with ${matchedDoc.name} targeting ${matchedDoc.targetMuscles?.[0] || target}.`;
  }

  return {
    exerciseDoc: matchedDoc,
    exerciseDto: toExerciseDto(matchedDoc),
    reasoning,
  };
}
