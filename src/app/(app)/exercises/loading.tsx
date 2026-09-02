import React from "react";
import { CardSkeleton, ListSkeleton } from "@/components/common/skeletons";

export default function ExercisesLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <CardSkeleton count={4} />
      <ListSkeleton count={6} />
    </div>
  );
}
