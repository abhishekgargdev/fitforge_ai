import { fail, ok } from "@/lib/api/response";
import { connectDB } from "@/lib/db/mongodb";
import {
  bodyPartQueryValue,
  equipmentQueryValue,
  targetQueryValue,
  toExerciseDto,
} from "@/lib/exercises/map";
import { exerciseListQuery } from "@/lib/validation/exercises";
import { ExerciseModel } from "@/models/Exercise";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parsed = exerciseListQuery.safeParse({
      q: url.searchParams.get("q") ?? "",
      bodyPart: url.searchParams.get("bodyPart") ?? "",
      equipment: url.searchParams.get("equipment") ?? "",
      target: url.searchParams.get("target") ?? "",
      difficulty: url.searchParams.get("difficulty") ?? "",
      page: url.searchParams.get("page") ?? "1",
      limit: url.searchParams.get("limit") ?? "24",
    });
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid query", 400, "VALIDATION_ERROR");
    }

    const { q, bodyPart, equipment, target, difficulty, page, limit } = parsed.data;
    const filter: Record<string, unknown> = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { target: { $regex: q, $options: "i" } },
        { bodyPart: { $regex: q, $options: "i" } },
        { primaryMuscles: { $regex: q, $options: "i" } },
      ];
    }

    if (bodyPart) {
      const value = bodyPartQueryValue(bodyPart);
      filter.bodyPart = Array.isArray(value) ? { $in: value } : value;
    }

    if (target) {
      filter.target = targetQueryValue(target);
    }

    if (equipment) {
      filter.equipment = equipmentQueryValue(equipment);
    }

    if (difficulty && difficulty.toLowerCase() !== "all") {
      const label =
        difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
      filter.difficulty = label;
    }

    await connectDB();
    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      ExerciseModel.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
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
