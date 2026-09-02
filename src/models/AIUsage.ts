import { Schema, model, models } from "mongoose";

const aiUsageSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    feature: {
      type: String,
      enum: ["chat", "nutrition-plan", "workout-plan", "progress-analysis"],
      required: true,
      index: true,
    },
    ok: { type: Boolean, required: true },
    date: { type: String, required: true, index: true },
  },
  { timestamps: true, collection: "aiUsage" }
);

aiUsageSchema.index({ userId: 1, date: 1, feature: 1 });

export const AIUsageModel = models.AIUsage ?? model("AIUsage", aiUsageSchema);
