import { Schema, model, models } from "mongoose";

const planExerciseSchema = new Schema(
  {
    exercise: { type: Schema.Types.ObjectId, ref: "Exercise", required: true },
    exerciseName: { type: String, required: true },
    targetMuscle: { type: String, required: true },
    sets: { type: Number, required: true },
    reps: { type: String, required: true },
    restSeconds: { type: Number, required: true },
    aiNote: { type: String, default: "" },
    equipment: { type: String, default: "" },
    targetWeightKg: { type: Number, default: 0 },
    imageUrl: { type: String, default: "" },
    difficulty: { type: String, default: "Intermediate" },
    instructions: { type: [String], default: [] },
    tips: { type: [String], default: [] },
    locked: { type: Boolean, default: false },
  },
  { _id: false }
);

const dayWorkoutSchema = new Schema(
  {
    name: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    muscleGroups: { type: [String], default: [] },
    category: {
      type: String,
      enum: ["Upper", "Lower", "Push", "Pull", "Full Body", "Cardio"],
      default: "Full Body",
    },
    exercises: { type: [planExerciseSchema], default: [] },
  },
  { _id: false }
);

const splitDaySchema = new Schema(
  {
    dayName: { type: String, required: true },
    focus: { type: String, default: "" },
    isRestDay: { type: Boolean, default: false },
    intensityLevel: {
      type: String,
      enum: ["light", "moderate", "hard"],
      default: "moderate",
    },
    locked: { type: Boolean, default: false },
    skipped: { type: Boolean, default: false },
    skipReason: { type: String, default: "" },
    scheduledDate: { type: Date },
    workout: { type: dayWorkoutSchema, default: undefined },
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

const workoutPlanSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    daysPerWeek: { type: Number, required: true },
    isActive: { type: Boolean, default: false, index: true },
    origin: {
      type: String,
      enum: ["MEASURED", "CALCULATED", "AI_RECOMMENDATION"],
      default: "AI_RECOMMENDATION",
    },
    planMode: {
      type: String,
      enum: ["ai", "manual"],
      default: "ai",
    },
    nextPlanGenerationDate: { type: Date, index: true },
    days: { type: [splitDaySchema], default: [] },
    swapHistory: { type: [swapHistorySchema], default: [] },
    plannerInputs: {
      goal: String,
      daysPerWeek: Number,
      duration: Number,
      experience: String,
      equipment: [String],
      focusMuscles: [String],
      preferences: String,
    },
  },
  { timestamps: true, collection: "workoutPlans" }
);

export const WorkoutPlanModel =
  models.WorkoutPlan ?? model("WorkoutPlan", workoutPlanSchema);
