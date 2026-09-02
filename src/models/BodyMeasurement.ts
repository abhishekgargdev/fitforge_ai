import { Schema, model, models } from "mongoose";

const bodyMeasurementSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },
    month: { type: String, default: "" },
    weightKg: { type: Number, required: true },
    bodyFatPercentage: { type: Number, required: true },
    muscleMassKg: { type: Number, default: 0 },
    bmi: { type: Number, required: true },
    visceralFat: { type: Number, default: 0 },
    bodyAge: { type: Number, default: 0 },
    restingMetabolismKcal: { type: Number, default: 0 },
    trunkFatPercentage: { type: Number, default: 0 },
    trunkMusclePercentage: { type: Number, default: 0 },
    armsFatPercentage: { type: Number, default: 0 },
    armsMusclePercentage: { type: Number, default: 0 },
    legsFatPercentage: { type: Number, default: 0 },
    legsMusclePercentage: { type: Number, default: 0 },
    chestCm: { type: Number, default: 0 },
    waistCm: { type: Number, default: 0 },
    hipsCm: { type: Number, default: 0 },
    bicepsCm: { type: Number, default: 0 },
    thighsCm: { type: Number, default: 0 },
    calvesCm: { type: Number, default: 0 },
    shouldersCm: { type: Number, default: 0 },
    neckCm: { type: Number, default: 0 },
    origin: {
      type: String,
      enum: ["MEASURED", "CALCULATED", "AI_RECOMMENDATION"],
      default: "MEASURED",
    },
  },
  { timestamps: true, collection: "bodyMeasurements" }
);

bodyMeasurementSchema.index({ userId: 1, date: -1 });

export const BodyMeasurement =
  models.BodyMeasurement ?? model("BodyMeasurement", bodyMeasurementSchema);
