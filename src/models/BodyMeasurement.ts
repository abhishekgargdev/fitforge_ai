import { Schema, model, models } from "mongoose";

const bodyMeasurementSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },
    month: { type: String, default: "" },
    weightKg: { type: Number, required: true },
    bodyFatPercentage: { type: Number },
    muscleMassKg: { type: Number },
    bmi: { type: Number },
    measuredBmi: { type: Number },
    visceralFat: { type: Number },
    bodyAge: { type: Number },
    restingMetabolismKcal: { type: Number },
    trunkFatPercentage: { type: Number },
    trunkMusclePercentage: { type: Number },
    armsFatPercentage: { type: Number },
    armsMusclePercentage: { type: Number },
    legsFatPercentage: { type: Number },
    legsMusclePercentage: { type: Number },
    chestCm: { type: Number },
    waistCm: { type: Number },
    hipsCm: { type: Number },
    bicepsCm: { type: Number },
    thighsCm: { type: Number },
    calvesCm: { type: Number },
    shouldersCm: { type: Number },
    neckCm: { type: Number },
    origin: {
      type: String,
      enum: ["MEASURED", "CALCULATED", "AI_RECOMMENDATION", "WORKOUT_CHECKIN"],
      default: "MEASURED",
    },
  },
  { timestamps: true, collection: "bodyMeasurements" }
);

bodyMeasurementSchema.index({ userId: 1, date: -1 });

export const BodyMeasurement =
  models.BodyMeasurement ?? model("BodyMeasurement", bodyMeasurementSchema);
