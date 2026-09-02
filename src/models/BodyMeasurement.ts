import { Schema, model, models } from "mongoose";

const bodyMeasurementSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },
    weightKg: { type: Number, required: true },
    bodyFatPercentage: { type: Number, required: true },
    bmi: { type: Number, required: true },
    origin: {
      type: String,
      enum: ["MEASURED", "CALCULATED", "AI_RECOMMENDATION"],
      default: "MEASURED",
    },
  },
  { timestamps: true, collection: "bodyMeasurements" }
);

export const BodyMeasurement =
  models.BodyMeasurement ?? model("BodyMeasurement", bodyMeasurementSchema);
