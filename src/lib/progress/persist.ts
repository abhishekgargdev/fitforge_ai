import { computedScanFields, monthLabel } from "@/lib/progress/map";
import type { measurementCreateSchema } from "@/lib/validation/progress";
import { BodyMeasurement } from "@/models/BodyMeasurement";
import { Profile } from "@/models/Profile";
import type { z } from "zod";

type Input = z.infer<typeof measurementCreateSchema>;

export async function persistMeasurement(
  userId: unknown,
  input: Input,
  existingId?: string
) {
  const [profile, latest, lastTape] = await Promise.all([
    Profile.findOne({ userId }),
    existingId
      ? BodyMeasurement.findOne({ _id: existingId, userId })
      : BodyMeasurement.findOne({ userId }).sort({ date: -1 }),
    BodyMeasurement.findOne({ userId, waistCm: { $gt: 0 } }).sort({ date: -1 }),
  ]);
  if (!profile) throw new Error("Profile not found");

  const date = input.date
    ? new Date(input.date)
    : existingId && latest?.date
      ? latest.date
      : new Date();
  const weightKg = input.weightKg ?? latest?.weightKg ?? profile.weightKg;
  const bodyFatPercentage =
    input.bodyFatPercentage ?? latest?.bodyFatPercentage ?? profile.bodyFatPercentage;
  const computed = computedScanFields({
    weightKg,
    heightCm: profile.heightCm,
    age: profile.age,
    gender: profile.gender as "male" | "female" | "other",
    bodyFatPercentage,
    muscleMassKg: input.muscleMassKg ?? latest?.muscleMassKg,
    bodyAge: input.bodyAge ?? latest?.bodyAge,
  });

  const measuredBmi = input.measuredBmi ?? input.bmi;

  const payload = {
    userId,
    date,
    month: monthLabel(date, input.month),
    weightKg,
    bodyFatPercentage,
    muscleMassKg: input.muscleMassKg ?? computed.muscleMassKg,
    bmi: computed.bmi,
    measuredBmi,
    visceralFat: input.visceralFat ?? latest?.visceralFat,
    bodyAge: input.bodyAge ?? computed.bodyAge,
    restingMetabolismKcal: computed.restingMetabolismKcal,
    trunkFatPercentage: input.trunkFatPercentage ?? latest?.trunkFatPercentage,
    trunkMusclePercentage: input.trunkMusclePercentage ?? latest?.trunkMusclePercentage,
    armsFatPercentage: input.armsFatPercentage ?? latest?.armsFatPercentage,
    armsMusclePercentage: input.armsMusclePercentage ?? latest?.armsMusclePercentage,
    legsFatPercentage: input.legsFatPercentage ?? latest?.legsFatPercentage,
    legsMusclePercentage: input.legsMusclePercentage ?? latest?.legsMusclePercentage,
    chestCm: input.chestCm ?? lastTape?.chestCm ?? latest?.chestCm,
    waistCm: input.waistCm ?? lastTape?.waistCm ?? latest?.waistCm,
    hipsCm: input.hipsCm ?? lastTape?.hipsCm ?? latest?.hipsCm,
    bicepsCm: input.bicepsCm ?? lastTape?.bicepsCm ?? latest?.bicepsCm,
    thighsCm: input.thighsCm ?? lastTape?.thighsCm ?? latest?.thighsCm,
    calvesCm: input.calvesCm ?? lastTape?.calvesCm ?? latest?.calvesCm,
    shouldersCm: input.shouldersCm ?? lastTape?.shouldersCm ?? latest?.shouldersCm,
    neckCm: input.neckCm ?? lastTape?.neckCm ?? latest?.neckCm,
    origin: "MEASURED" as const,
  };

  if (existingId) {
    if (!latest || String(latest._id) !== existingId) return null;
    Object.assign(latest, payload);
    await latest.save();
    return latest;
  }

  return BodyMeasurement.create(payload);
}
