import test from "node:test";
import assert from "node:assert/strict";

import { resolveGeminiModelName, isValidAiUsageUserId } from "./orchestrator";

test("resolveGeminiModelName prefers a supported Gemini model", () => {
  assert.equal(resolveGeminiModelName(), "gemini-3.6-flash");
  assert.equal(resolveGeminiModelName("gemini-1.5-flash"), "gemini-1.5-flash");
  assert.equal(resolveGeminiModelName("gemini-3.6-flash"), "gemini-3.6-flash");
});

test("isValidAiUsageUserId rejects non-objectid fallback values", () => {
  assert.equal(isValidAiUsageUserId("system"), false);
  assert.equal(isValidAiUsageUserId("507f1f77bcf86cd799439011"), true);
  assert.equal(isValidAiUsageUserId(undefined), false);
});
