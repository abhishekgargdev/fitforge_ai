"use client";

import { useParams } from "next/navigation";
import { ExerciseDetailView } from "@/components/views/ExerciseDetailView";

export default function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <ExerciseDetailView exerciseId={id} />;
}
