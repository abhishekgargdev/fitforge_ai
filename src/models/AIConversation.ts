import { Schema, model, models } from "mongoose";

const messageSchema = new Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    text: { type: String, required: true },
    origin: {
      type: String,
      enum: ["MEASURED", "CALCULATED", "AI_RECOMMENDATION"],
      default: "AI_RECOMMENDATION",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const aiConversationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "Coach chat" },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true, collection: "aiConversations" }
);

aiConversationSchema.index({ userId: 1, updatedAt: -1 });

export const AIConversationModel =
  models.AIConversation ?? model("AIConversation", aiConversationSchema);
