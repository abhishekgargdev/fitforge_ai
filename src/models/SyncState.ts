// src/models/SyncState.ts
import { Schema, model, models } from "mongoose";

const SyncStateSchema = new Schema({
  key: { type: String, unique: true, required: true },
  cursor: { type: String, default: null },
  updatedAt: { type: Date, default: Date.now },
});

export const SyncStateModel = models.SyncState || model("SyncState", SyncStateSchema);