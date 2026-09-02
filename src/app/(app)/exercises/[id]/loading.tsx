import React from "react";
import { CardSkeleton, ListSkeleton } from "@/components/common/skeletons";

export default function ExerciseDetailLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <CardSkeleton count={1} />
      <ListSkeleton count={3} />
    </div>
  );
}
