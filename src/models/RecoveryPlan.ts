import { Schema, model, models } from "mongoose";

const recoveryItemSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["shower", "stretch", "mobility", "supplement", "meditation", "sleep", "hydration"],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    source: { type: String, default: "ai" },
  },
  { _id: false }
);

const recoveryPlanSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    items: { type: [recoveryItemSchema], default: [] },
    origin: {
      type: String,
      enum: ["MEASURED", "CALCULATED", "AI_RECOMMENDATION"],
      default: "AI_RECOMMENDATION",
    },
  },
  { timestamps: true, collection: "recoveryPlans" }
);

recoveryPlanSchema.index({ userId: 1, date: -1 });

export const RecoveryPlanModel =
  models.RecoveryPlan ?? model("RecoveryPlan", recoveryPlanSchema);
