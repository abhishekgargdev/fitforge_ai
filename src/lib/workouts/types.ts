export type SessionSetLike = {
  setNumber: number;
  targetWeightKg: number;
  targetReps: number;
  actualWeightKg: number;
  actualReps: number;
  rpe?: number;
  completed: boolean;
};

export type SessionExerciseLike = {
  exercise: { toString(): string };
  exerciseName: string;
  sets: SessionSetLike[];
  restSeconds?: number;
  aiNote?: string;
  toObject?: () => Record<string, unknown>;
};
