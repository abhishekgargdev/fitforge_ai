import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/mongodb";
import {
  bodyPartQueryValue,
  equipmentQueryValue,
  targetQueryValue,
  toExerciseDto,
} from "@/lib/exercises/map";
import { createExerciseSchema, exerciseListQuery } from "@/lib/validation/exercises";
import { ExerciseModel } from "@/models/Exercise";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parsed = exerciseListQuery.safeParse({
      q: url.searchParams.get("q") ?? "",
      bodyPart: url.searchParams.get("bodyPart") ?? "",
      bodyParts: url.searchParams.get("bodyParts") ?? "",
      equipment: url.searchParams.get("equipment") ?? "",
      equipments: url.searchParams.get("equipments") ?? "",
      target: url.searchParams.get("target") ?? "",
      targetMuscles: url.searchParams.get("targetMuscles") ?? "",
      difficulty: url.searchParams.get("difficulty") ?? "",
      source: url.searchParams.get("source") ?? "all",
      page: url.searchParams.get("page") ?? "1",
      limit: url.searchParams.get("limit") ?? "24",
    });
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid query", 400, "VALIDATION_ERROR");
    }

    const {
      q,
      bodyPart,
      bodyParts,
      equipment,
      equipments,
      target,
      targetMuscles,
      difficulty,
      source,
      page,
      limit,
    } = parsed.data;

    const filter: Record<string, unknown> = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { targetMuscles: { $regex: q, $options: "i" } },
        { bodyParts: { $regex: q, $options: "i" } },
        { primaryMuscles: { $regex: q, $options: "i" } },
        { equipments: { $regex: q, $options: "i" } },
      ];
    }

    const effectiveBodyPart = bodyParts || bodyPart;
    if (effectiveBodyPart) {
      const value = bodyPartQueryValue(effectiveBodyPart);
      filter.bodyParts = Array.isArray(value) ? { $in: value } : value;
    }

    const effectiveTarget = targetMuscles || target;
    if (effectiveTarget) {
      filter.targetMuscles = targetQueryValue(effectiveTarget);
    }

    const effectiveEquipment = equipments || equipment;
    if (effectiveEquipment) {
      filter.equipments = equipmentQueryValue(effectiveEquipment);
    }

    if (difficulty && difficulty.toLowerCase() !== "all") {
      const label =
        difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
      filter.difficulty = label;
    }

    if (source && source !== "all") {
      filter.source = source;
    }

    await connectDB();
    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      ExerciseModel.find(filter).sort({ createdAt: -1, name: 1 }).skip(skip).limit(limit),
      ExerciseModel.countDocuments(filter),
    ]);

    return ok({
      items: rows.map((row) => toExerciseDto(row)),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    console.error("[exercises:list]", error);
    return fail("Unable to load exercises.", 500, "EXERCISES_LOAD_FAILED");
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");

    const json = await request.json();
    const parsed = createExerciseSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input", 400, "VALIDATION_ERROR");
    }

    const body = parsed.data;
    const exerciseId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    await connectDB();
    const doc = await ExerciseModel.create({
      exerciseId,
      name: body.name,
      bodyParts: body.bodyParts,
      targetMuscles: body.targetMuscles,
      primaryMuscles: body.targetMuscles,
      secondaryMuscles: body.secondaryMuscles,
      equipments: body.equipments,
      difficulty: body.difficulty,
      exerciseType: body.exerciseType,
      gifUrl: body.gifUrl,
      instructions: body.instructions,
      source: "user",
      createdBy: session.user._id,
      cloudinaryPublicId: body.cloudinaryPublicId,
    });

    return ok({ item: toExerciseDto(doc) }, 201);
  } catch (error) {
    console.error("[exercises:create]", error);
    return fail("Unable to create exercise.", 500, "EXERCISE_CREATE_FAILED");
  }
}
