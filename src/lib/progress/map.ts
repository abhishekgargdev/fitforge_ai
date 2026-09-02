import { bmi, bmr } from "@/lib/calculations";
import type {
  BodyCompositionDetails,
  BodyMeasurementRecord,
  MetricEntry,
  MonthlyMeasurement,
} from "@/types";

export type MeasurementDoc = {
  _id: { toString(): string };
  userId: { toString(): string };
  date: Date;
  month?: string;
  weightKg: number;
  bodyFatPercentage: number;
  muscleMassKg?: number;
  bmi: number;
  visceralFat?: number;
  bodyAge?: number;
  restingMetabolismKcal?: number;
  trunkFatPercentage?: number;
  trunkMusclePercentage?: number;
  armsFatPercentage?: number;
  armsMusclePercentage?: number;
  legsFatPercentage?: number;
  legsMusclePercentage?: number;
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  bicepsCm?: number;
  thighsCm?: number;
  calvesCm?: number;
  shouldersCm?: number;
  neckCm?: number;
  origin?: BodyMeasurementRecord["origin"];
};

export function monthLabel(date: Date, fallback = "") {
  if (fallback) return fallback;
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

export function shortDateLabel(date: Date) {
  return date.toLocaleString("en-US", { month: "short", day: "numeric" });
}

export function estimatedMuscleMassKg(weightKg: number, bodyFatPercentage: number) {
  return Math.round(weightKg * (1 - bodyFatPercentage / 100) * 10) / 10;
}

export function computedScanFields(input: {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: "male" | "female" | "other";
  bodyFatPercentage: number;
  muscleMassKg?: number;
  bodyAge?: number;
}) {
  return {
    bmi: bmi(input.weightKg, input.heightCm),
    muscleMassKg:
      input.muscleMassKg && input.muscleMassKg > 0
        ? input.muscleMassKg
        : estimatedMuscleMassKg(input.weightKg, input.bodyFatPercentage),
    restingMetabolismKcal: bmr({
      weightKg: input.weightKg,
      heightCm: input.heightCm,
      age: input.age,
      gender: input.gender,
    }),
    bodyAge: input.bodyAge && input.bodyAge > 0 ? input.bodyAge : input.age,
  };
}

export function toMeasurementDto(doc: MeasurementDoc): BodyMeasurementRecord {
  return {
    id: String(doc._id),
    userId: String(doc.userId),
    date: doc.date.toISOString(),
    month: monthLabel(doc.date, doc.month),
    weightKg: doc.weightKg,
    bodyFatPercentage: doc.bodyFatPercentage,
    muscleMassKg: doc.muscleMassKg ?? 0,
    bmi: doc.bmi,
    visceralFat: doc.visceralFat ?? 0,
    bodyAge: doc.bodyAge ?? 0,
    restingMetabolismKcal: doc.restingMetabolismKcal ?? 0,
    trunkFatPercentage: doc.trunkFatPercentage ?? 0,
    trunkMusclePercentage: doc.trunkMusclePercentage ?? 0,
    armsFatPercentage: doc.armsFatPercentage ?? 0,
    armsMusclePercentage: doc.armsMusclePercentage ?? 0,
    legsFatPercentage: doc.legsFatPercentage ?? 0,
    legsMusclePercentage: doc.legsMusclePercentage ?? 0,
    chestCm: doc.chestCm ?? 0,
    waistCm: doc.waistCm ?? 0,
    hipsCm: doc.hipsCm ?? 0,
    bicepsCm: doc.bicepsCm ?? 0,
    thighsCm: doc.thighsCm ?? 0,
    calvesCm: doc.calvesCm ?? 0,
    shouldersCm: doc.shouldersCm ?? 0,
    neckCm: doc.neckCm ?? 0,
    origin: doc.origin || "MEASURED",
  };
}

export function toMetricEntry(doc: MeasurementDoc): MetricEntry {
  const dto = toMeasurementDto(doc);
  return {
    date: shortDateLabel(doc.date),
    weightKg: dto.weightKg,
    bodyFatPercentage: dto.bodyFatPercentage,
    muscleMassKg: dto.muscleMassKg,
    bmi: dto.bmi,
    visceralFat: dto.visceralFat,
    bodyAge: dto.bodyAge,
    restingMetabolismKcal: dto.restingMetabolismKcal,
  };
}

export function toMonthlyMeasurement(doc: MeasurementDoc): MonthlyMeasurement {
  const dto = toMeasurementDto(doc);
  return {
    id: dto.id,
    month: dto.month,
    date: dto.date.slice(0, 10),
    chestCm: dto.chestCm,
    waistCm: dto.waistCm,
    hipsCm: dto.hipsCm,
    bicepsCm: dto.bicepsCm,
    thighsCm: dto.thighsCm,
    calvesCm: dto.calvesCm,
    shouldersCm: dto.shouldersCm,
    neckCm: dto.neckCm,
  };
}

export function toComposition(doc: MeasurementDoc | null): BodyCompositionDetails {
  if (!doc) {
    return {
      date: "",
      overall: {
        weightKg: 0,
        bmi: 0,
        bodyFatPercentage: 0,
        visceralFat: 0,
        bodyAge: 0,
        restingMetabolismKcal: 0,
      },
      trunk: { fatPercentage: 0, musclePercentage: 0 },
      arms: { fatPercentage: 0, musclePercentage: 0 },
      legs: { fatPercentage: 0, musclePercentage: 0 },
    };
  }
  const dto = toMeasurementDto(doc);
  return {
    date: dto.month,
    overall: {
      weightKg: dto.weightKg,
      bmi: dto.bmi,
      bodyFatPercentage: dto.bodyFatPercentage,
      visceralFat: dto.visceralFat,
      bodyAge: dto.bodyAge,
      restingMetabolismKcal: dto.restingMetabolismKcal,
    },
    trunk: {
      fatPercentage: dto.trunkFatPercentage,
      musclePercentage: dto.trunkMusclePercentage,
    },
    arms: {
      fatPercentage: dto.armsFatPercentage,
      musclePercentage: dto.armsMusclePercentage,
    },
    legs: {
      fatPercentage: dto.legsFatPercentage,
      musclePercentage: dto.legsMusclePercentage,
    },
  };
}

export const METRIC_FIELDS = {
  weight: { field: "weightKg" as const, unit: "kg" },
  fat: { field: "bodyFatPercentage" as const, unit: "%" },
  muscle: { field: "muscleMassKg" as const, unit: "kg" },
  bmi: { field: "bmi" as const, unit: "" },
  bodyAge: { field: "bodyAge" as const, unit: "yrs" },
  visceralFat: { field: "visceralFat" as const, unit: "lvl" },
  restingMetabolism: { field: "restingMetabolismKcal" as const, unit: "kcal" },
};

export function rangeStartDate(range: "1m" | "3m" | "6m" | "1y" | "all", now = new Date()) {
  if (range === "all") return null;
  const start = new Date(now);
  if (range === "1m") start.setMonth(start.getMonth() - 1);
  if (range === "3m") start.setMonth(start.getMonth() - 3);
  if (range === "6m") start.setMonth(start.getMonth() - 6);
  if (range === "1y") start.setFullYear(start.getFullYear() - 1);
  return start;
}
