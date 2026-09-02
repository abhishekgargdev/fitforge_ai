import React from "react";
import { CardSkeleton, ChartSkeleton, ListSkeleton } from "@/components/common/skeletons";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <CardSkeleton count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ChartSkeleton height="h-72" />
        </div>
        <div>
          <ListSkeleton count={4} />
        </div>
      </div>
    </div>
  );
}
