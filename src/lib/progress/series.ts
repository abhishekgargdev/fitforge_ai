import {
  absoluteDelta,
  chartSeries,
  progressDelta,
  progressTrend,
  recompositionScore,
} from "@/lib/calculations";
import {
  METRIC_FIELDS,
  rangeStartDate,
  toComposition,
  toMeasurementDto,
  toMetricEntry,
  toMonthlyMeasurement,
  type MeasurementDoc,
} from "@/lib/progress/map";
import { BodyMeasurement } from "@/models/BodyMeasurement";
import type { ProgressMetric, ProgressRange } from "@/lib/progress/types";

export type { ProgressMetric, ProgressRange };

export async function listMeasurements(
  userId: unknown,
  filter: { from?: string; to?: string } = {}
) {
  const query: Record<string, unknown> = { userId };
  if (filter.from || filter.to) {
    query.date = {
      ...(filter.from ? { $gte: new Date(filter.from) } : {}),
      ...(filter.to ? { $lte: new Date(`${filter.to}T23:59:59.999Z`) } : {}),
    };
  }
  return BodyMeasurement.find(query).sort({ date: 1 }).lean();
}

export async function measurementsInRange(userId: unknown, range: ProgressRange) {
  const start = rangeStartDate(range);
  return listMeasurements(userId, start ? { from: start.toISOString() } : {});
}

function metricValue(doc: MeasurementDoc, metric: ProgressMetric) {
  const field = METRIC_FIELDS[metric].field;
  return Number(doc[field] ?? 0);
}

export function buildProgressSeries(rows: MeasurementDoc[], metric: ProgressMetric) {
  const points = rows.map((row) => ({
    date: row.date.toISOString(),
    label: row.date.toLocaleString("en-US", { month: "short", day: "numeric" }),
    value: metricValue(row, metric),
  }));
  return {
    metric,
    unit: METRIC_FIELDS[metric].unit,
    series: chartSeries(points),
  };
}

function snapshot(current: number, previous: number | undefined, epsilon = 0.15) {
  return {
    current,
    previous: previous ?? null,
    absDelta: absoluteDelta(current, previous),
    percentDelta: previous == null ? 0 : progressDelta(current, previous || 0),
    trend: progressTrend(current, previous, epsilon),
  };
}

export function buildProgressSummary(rows: MeasurementDoc[]) {
  const latest = rows[rows.length - 1] || null;
  const previous = rows.length > 1 ? rows[rows.length - 2] : null;
  const oldest = rows[0] || null;
  const latestDto = latest ? toMeasurementDto(latest) : null;
  const previousDto = previous ? toMeasurementDto(previous) : null;
  const oldestDto = oldest ? toMeasurementDto(oldest) : null;

  const metrics = {
    weight: snapshot(latestDto?.weightKg ?? 0, previousDto?.weightKg),
    fat: snapshot(latestDto?.bodyFatPercentage ?? 0, previousDto?.bodyFatPercentage),
    muscle: snapshot(latestDto?.muscleMassKg ?? 0, previousDto?.muscleMassKg),
    bmi: snapshot(latestDto?.bmi ?? 0, previousDto?.bmi, 0.05),
    bodyAge: snapshot(latestDto?.bodyAge ?? 0, previousDto?.bodyAge, 0.4),
    visceralFat: snapshot(latestDto?.visceralFat ?? 0, previousDto?.visceralFat, 0.4),
    restingMetabolism: snapshot(
      latestDto?.restingMetabolismKcal ?? 0,
      previousDto?.restingMetabolismKcal,
      5
    ),
  };

  const waist = snapshot(latestDto?.waistCm ?? 0, oldestDto?.waistCm ?? previousDto?.waistCm);
  const score = recompositionScore({
    fatDelta: metrics.fat.absDelta,
    muscleDelta: metrics.muscle.absDelta,
    waistDelta: waist.absDelta,
    visceralDelta: metrics.visceralFat.absDelta,
  });

  return {
    metrics,
    waist,
    recompScore: score,
    composition: toComposition(latest),
    previousComposition: previous ? toComposition(previous) : null,
    metricEntries: rows.map(toMetricEntry),
    monthly: [...rows].reverse().map(toMonthlyMeasurement),
  };
}

export function compareMeasurements(a: MeasurementDoc, b: MeasurementDoc) {
  const older = a.date <= b.date ? a : b;
  const newer = a.date <= b.date ? b : a;
  const olderDto = toMeasurementDto(older);
  const newerDto = toMeasurementDto(newer);
  const zones: Array<{
    key: keyof typeof newerDto;
    label: string;
    goal: "gain" | "drop" | "maintain";
  }> = [
    { key: "chestCm", label: "Chest", goal: "gain" },
    { key: "waistCm", label: "Waist (Umbilicus)", goal: "drop" },
    { key: "hipsCm", label: "Hips / Glutes", goal: "maintain" },
    { key: "bicepsCm", label: "Biceps (Flexed)", goal: "gain" },
    { key: "thighsCm", label: "Thighs (Mid-quad)", goal: "gain" },
    { key: "calvesCm", label: "Calves", goal: "gain" },
    { key: "shouldersCm", label: "Shoulders (Circumference)", goal: "gain" },
    { key: "neckCm", label: "Neck", goal: "maintain" },
  ];

  return {
    a: olderDto,
    b: newerDto,
    rows: zones.map((zone) => {
      const currentVal = Number(newerDto[zone.key] ?? 0);
      const prevVal = Number(olderDto[zone.key] ?? 0);
      const delta = absoluteDelta(currentVal, prevVal);
      const favorable =
        (zone.goal === "drop" && delta < 0) ||
        (zone.goal === "gain" && delta > 0) ||
        (zone.goal === "maintain" && Math.abs(delta) < 0.5);
      return {
        key: zone.key,
        label: zone.label,
        goal: zone.goal,
        a: prevVal,
        b: currentVal,
        delta,
        favorable,
      };
    }),
  };
}
