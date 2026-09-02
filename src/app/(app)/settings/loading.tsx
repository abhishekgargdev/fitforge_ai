import React from "react";
import { CardSkeleton } from "@/components/common/skeletons";

export default function SettingsLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <CardSkeleton count={3} />
    </div>
  );
}
