import type { WorkoutTemplate } from "@/types";

export const emptyWorkout: WorkoutTemplate = {
  id: "",
  name: "Rest day",
  durationMinutes: 0,
  exercises: [],
  muscleGroups: [],
  category: "Full Body",
};
