"use client";

import { useParams } from "next/navigation";
import WorkoutsPage from "../page";

export default function WorkoutDetailPage() {
  useParams<{ id: string }>();
  return <WorkoutsPage />;
}
