import { fail, ok } from "@/lib/api/response";
import { connectDB } from "@/lib/db/mongodb";
import { toExerciseDto } from "@/lib/exercises/map";
import { ExerciseModel } from "@/models/Exercise";
import mongoose from "mongoose";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) return fail("Exercise id is required.", 400, "VALIDATION_ERROR");

    await connectDB();
    let current = await ExerciseModel.findOne({ exerciseId: id });
    if (!current && mongoose.Types.ObjectId.isValid(id)) {
      current = await ExerciseModel.findById(id);
    }
    if (!current) return fail("Exercise not found.", 404, "EXERCISE_NOT_FOUND");

    const targets = current.targetMuscles?.length ? current.targetMuscles : [current.target];
    const parts = current.bodyParts?.length ? current.bodyParts : [current.bodyPart];

    const byTarget = await ExerciseModel.find({
      exerciseId: { $ne: current.exerciseId },
      _id: { $ne: current._id },
      targetMuscles: { $in: targets },
    })
      .sort({ name: 1 })
      .limit(8);

    let related = byTarget;
    if (related.length < 8) {
      const excludeIds = [current._id, ...related.map((row) => row._id)];
      const extra = await ExerciseModel.find({
        _id: { $nin: excludeIds },
        bodyParts: { $in: parts },
      })
        .sort({ name: 1 })
        .limit(8 - related.length);
      related = [...related, ...extra];
    }

    return ok({
      items: related.map((row) => toExerciseDto(row)),
    });
  } catch (error) {
    console.error("[exercises:related]", error);
    return fail("Unable to load related exercises.", 500, "RELATED_LOAD_FAILED");
  }
}
