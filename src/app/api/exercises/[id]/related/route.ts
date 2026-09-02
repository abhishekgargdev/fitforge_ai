import { fail, ok } from "@/lib/api/response";
import { connectDB } from "@/lib/db/mongodb";
import { toExerciseDto } from "@/lib/exercises/map";
import { ExerciseModel } from "@/models/Exercise";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) return fail("Exercise id is required.", 400, "VALIDATION_ERROR");

    await connectDB();
    const current = await ExerciseModel.findOne({ exerciseId: id });
    if (!current) return fail("Exercise not found.", 404, "EXERCISE_NOT_FOUND");

    const byTarget = await ExerciseModel.find({
      exerciseId: { $ne: id },
      target: current.target,
    })
      .sort({ name: 1 })
      .limit(8);

    let related = byTarget;
    if (related.length < 8) {
      const extra = await ExerciseModel.find({
        exerciseId: { $nin: [id, ...related.map((row) => row.exerciseId)] },
        bodyPart: current.bodyPart,
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
