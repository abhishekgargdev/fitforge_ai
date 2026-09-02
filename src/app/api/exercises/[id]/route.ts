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
    let row = await ExerciseModel.findOne({ exerciseId: id });
    if (!row && mongoose.Types.ObjectId.isValid(id)) {
      row = await ExerciseModel.findById(id);
    }

    if (!row) return fail("Exercise not found.", 404, "EXERCISE_NOT_FOUND");

    return ok({ exercise: toExerciseDto(row) });
  } catch (error) {
    console.error("[exercises:get]", error);
    return fail("Unable to load exercise.", 500, "EXERCISE_LOAD_FAILED");
  }
}
