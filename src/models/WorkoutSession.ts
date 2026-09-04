import { Schema, model, type InferSchemaType, type Model } from "mongoose";

const sessionSetSchema = new Schema(
  {
    setNumber: { type: Number, required: true },
    targetWeightKg: { type: Number, required: true },
    targetReps: { type: Number, required: true },
    actualWeightKg: { type: Number, required: true },
    actualReps: { type: Number, required: true },
    targetDurationSeconds: { type: Number, default: 0 },
    actualDurationSeconds: { type: Number, default: 0 },
    rpe: { type: Number, default: 8 },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const sessionExerciseSchema = new Schema(
  {
    exercise: { type: Schema.Types.ObjectId, ref: "Exercise", required: true },
    exerciseName: { type: String, required: true },
    targetMuscle: { type: String, required: true },
    equipment: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    difficulty: { type: String, default: "Intermediate" },
    instructions: { type: [String], default: [] },
    tips: { type: [String], default: [] },
    restSeconds: { type: Number, required: true },
    aiNote: { type: String, default: "" },
    skipped: { type: Boolean, default: false },
    skippedReason: { type: String, default: "" },
    phase: {
      type: String,
      enum: ["warmup", "cardio", "bodyweight", "main", "cooldown"],
      default: "main",
    },
    trackingType: {
      type: String,
      enum: ["reps", "timer"],
      default: "reps",
    },
    targetDurationSeconds: { type: Number, default: 0 },
    isStretchFallback: { type: Boolean, default: false },
    stretchInstructions: { type: [String], default: [] },
    sets: { type: [sessionSetSchema], default: [] },
  },
  { _id: false }
);

const swapHistorySchema = new Schema(
  {
    originalExerciseId: { type: String, required: true },
    originalExerciseName: { type: String, required: true },
    swappedToExerciseId: { type: Schema.Types.ObjectId, ref: "Exercise", required: true },
    swappedToExerciseName: { type: String, required: true },
    swappedAt: { type: Date, default: Date.now },
    reason: { type: String, default: "" },
  },
  { _id: false }
);

const workoutSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    workoutPlanId: { type: Schema.Types.ObjectId, ref: "WorkoutPlan" },
    dayIndex: { type: Number, default: 0 },
    workoutName: { type: String, required: true },
    status: { type: String, enum: ["in_progress", "completed"], default: "in_progress", index: true },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    durationMinutes: { type: Number, default: 0 },
    exercises: { type: [sessionExerciseSchema], default: [] },
    swapHistory: { type: [swapHistorySchema], default: [] },
    totalVolumeKg: { type: Number, default: 0 },
    totalSets: { type: Number, default: 0 },
    totalExercises: { type: Number, default: 0 },
    caloriesBurnedEstimate: { type: Number, default: 0 },
    personalRecords: { type: [String], default: [] },
    volumeChangeVsPreviousPercentage: { type: Number, default: 0 },
    aiSummary: { type: String, default: "" },
  },
  { timestamps: true, collection: "workoutSessions" }
);

export type WorkoutSessionDocument = InferSchemaType<typeof workoutSessionSchema>;

export const WorkoutSessionModel: Model<WorkoutSessionDocument> = model<WorkoutSessionDocument>(
  "WorkoutSessionV2",
  workoutSessionSchema,
  "workoutSessions"
);
