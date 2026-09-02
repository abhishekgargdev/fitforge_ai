import React from "react";
import { CardSkeleton, ListSkeleton } from "@/components/common/skeletons";

export default function WorkoutsLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <CardSkeleton count={2} />
      <ListSkeleton count={5} />
    </div>
  );
}
