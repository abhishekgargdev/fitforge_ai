import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/mongodb";
import { WorkoutPlanModel } from "@/models/WorkoutPlan";
import { ExerciseModel } from "@/models/Exercise";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; dayId: string }> }
) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");

    const { id, dayId } = await context.params;
    if (!id || !dayId) return fail("Plan ID and Day ID are required.", 400, "VALIDATION_ERROR");

    const body = await request.json();
    const { exerciseId, sets = 3, reps = "8-12", restSeconds = 90 } = body;
    if (!exerciseId) return fail("exerciseId is required.", 400, "VALIDATION_ERROR");

    await connectDB();
    const plan = await WorkoutPlanModel.findOne({ _id: id, userId: session.user._id });
    if (!plan) return fail("Workout plan not found.", 404, "PLAN_NOT_FOUND");

    const day = plan.days.find((d: any) => d.dayName.toLowerCase() === dayId.toLowerCase() || String(d._id) === dayId);
    if (!day) return fail("Workout day not found.", 404, "DAY_NOT_FOUND");

    if (day.isRestDay || !day.workout) {
      day.isRestDay = false;
      day.workout = {
        name: `${day.dayName} Workout`,
        durationMinutes: 45,
        muscleGroups: [],
        category: "Full Body",
        exercises: [],
      };
    }

    let exerciseDoc = await ExerciseModel.findOne({ exerciseId });
    if (!exerciseDoc) exerciseDoc = await ExerciseModel.findById(exerciseId);
    if (!exerciseDoc) return fail("Exercise not found.", 404, "EXERCISE_NOT_FOUND");

    const targetMuscle = exerciseDoc.targetMuscles?.[0] || exerciseDoc.target || "General";
    const eqName = exerciseDoc.equipments?.[0] || exerciseDoc.equipment || "body weight";

    const newExercise = {
      exercise: exerciseDoc._id,
      exerciseName: exerciseDoc.name,
      targetMuscle,
      sets: Number(sets),
      reps: String(reps),
      restSeconds: Number(restSeconds),
      aiNote: "User custom added exercise",
      equipment: eqName,
      targetWeightKg: 0,
      imageUrl: exerciseDoc.gifUrl,
      difficulty: exerciseDoc.difficulty,
      instructions: exerciseDoc.instructions,
      tips: exerciseDoc.tips,
      locked: false,
    };

    day.workout.exercises.push(newExercise);
    await plan.save();

    return ok({ success: true, plan }, 201);
  } catch (error) {
    console.error("[workout-plans:add-exercise]", error);
    return fail("Unable to add exercise to plan.", 500, "ADD_EXERCISE_FAILED");
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string; dayId: string }> }
) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");

    const { id, dayId } = await context.params;
    if (!id || !dayId) return fail("Plan ID and Day ID are required.", 400, "VALIDATION_ERROR");

    const body = await request.json();
    const { exerciseOrder } = body; // Array of exercise IDs or exercise names in target sequence
    if (!Array.isArray(exerciseOrder)) {
      return fail("exerciseOrder must be an array of identifiers.", 400, "VALIDATION_ERROR");
    }

    await connectDB();
    const plan = await WorkoutPlanModel.findOne({ _id: id, userId: session.user._id });
    if (!plan) return fail("Workout plan not found.", 404, "PLAN_NOT_FOUND");

    const day = plan.days.find((d: any) => d.dayName.toLowerCase() === dayId.toLowerCase() || String(d._id) === dayId);
    if (!day || !day.workout) return fail("Workout day not found.", 404, "DAY_NOT_FOUND");

    const existingMap = new Map<string, any>();
    day.workout.exercises.forEach((ex: any) => {
      existingMap.set(String(ex.exercise), ex);
      existingMap.set(ex.exerciseName.toLowerCase(), ex);
    });

    const reordered: any[] = [];
    const used = new Set<string>();

    for (const key of exerciseOrder) {
      const match = existingMap.get(String(key)) || existingMap.get(String(key).toLowerCase());
      if (match && !used.has(String(match.exercise))) {
        reordered.push(match);
        used.add(String(match.exercise));
      }
    }

    // Append any exercises not included in exerciseOrder to avoid accidental deletion
    day.workout.exercises.forEach((ex: any) => {
      if (!used.has(String(ex.exercise))) {
        reordered.push(ex);
      }
    });

    day.workout.exercises = reordered;
    await plan.save();

    return ok({ success: true, plan });
  } catch (error) {
    console.error("[workout-plans:reorder-exercises]", error);
    return fail("Unable to reorder exercises.", 500, "REORDER_FAILED");
  }
}
