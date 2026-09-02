import React from "react";
import { CardSkeleton } from "@/components/common/skeletons";

export default function ProfileLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <CardSkeleton count={4} />
      <CardSkeleton count={2} />
    </div>
  );
}
