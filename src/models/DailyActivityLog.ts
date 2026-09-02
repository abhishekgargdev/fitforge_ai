import { Schema, model, models } from "mongoose";

const dailyActivityLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    steps: { type: Number },
    activityType: { type: String }, // e.g. "walk", "yoga", "swimming", "cycling", "mobility", "sports", "stretching"
    durationMinutes: { type: Number },
    notes: { type: String },
  },
  { timestamps: true, collection: "dailyActivityLogs" }
);

dailyActivityLogSchema.index({ userId: 1, date: 1 });

export const DailyActivityLogModel =
  models.DailyActivityLog ?? model("DailyActivityLog", dailyActivityLogSchema);
