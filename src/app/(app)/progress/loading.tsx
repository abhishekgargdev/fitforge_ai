import React from "react";
import { CardSkeleton, ChartSkeleton, TableSkeleton } from "@/components/common/skeletons";

export default function ProgressLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <CardSkeleton count={3} />
      <ChartSkeleton height="h-72" />
      <TableSkeleton rows={4} cols={4} />
    </div>
  );
}
