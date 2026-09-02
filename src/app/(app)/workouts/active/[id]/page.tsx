"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ActiveWorkoutTracker } from "@/components/views/ActiveWorkoutTracker";
import { WorkoutCompletionModal } from "@/components/modals/WorkoutCompletionModal";
import type { ActiveWorkoutExercise, CompletedWorkoutSummary, WorkoutTemplate } from "@/types";

export default function ActiveWorkoutPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [workout, setWorkout] = useState<WorkoutTemplate | null>(null);
  const [logged, setLogged] = useState<ActiveWorkoutExercise[]>([]);
  const [summary, setSummary] = useState<CompletedWorkoutSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/workouts/${id}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || "Workout not found.");
        setWorkout(json.data.session.workout);
        setLogged(
          (json.data.session.exercises || []).map(
            (ex: {
              exercise: string;
              exerciseName: string;
              targetMuscle: string;
              equipment?: string;
              imageUrl?: string;
              difficulty?: string;
              instructions?: string[];
              tips?: string[];
              restSeconds: number;
              aiNote?: string;
              sets: ActiveWorkoutExercise["sets"];
            }) => ({
              exercise: {
                id: String(ex.exercise),
                name: ex.exerciseName,
                targetMuscle: ex.targetMuscle,
                secondaryMuscles: [],
                equipment: ex.equipment || "",
                difficulty: ex.difficulty || "Intermediate",
                exerciseType: "Strength",
                imageUrl: ex.imageUrl || "",
                instructions: ex.instructions || [],
                commonMistakes: [],
                tips: ex.tips || [],
              },
              sets: ex.sets,
              restSeconds: ex.restSeconds,
              aiNote: ex.aiNote,
            })
          )
        );
        if (json.data.session.summary) setSummary(json.data.session.summary);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load workout."));
  }, [id]);

  if (error) return <p className="text-sm text-[#F05D5E]">{error}</p>;
  if (!workout) return <p className="text-sm text-[#9AA3A0]">Loading session…</p>;

  return (
    <>
      <ActiveWorkoutTracker
        workout={workout}
        loggedExercises={logged}
        sessionId={id}
        onFinishWorkout={(done) => setSummary(done)}
        onCancel={() => router.push("/workouts")}
      />
      {summary && (
        <WorkoutCompletionModal
          summary={summary}
          onClose={() => router.push("/dashboard")}
          onViewSummary={() => router.push("/workouts")}
        />
      )}
    </>
  );
}
