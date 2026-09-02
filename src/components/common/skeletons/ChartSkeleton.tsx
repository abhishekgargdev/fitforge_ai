import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartSkeletonProps {
  className?: string;
  height?: string;
}

export const ChartSkeleton: React.FC<ChartSkeletonProps> = ({
  className = "",
  height = "h-64",
}) => {
  return (
    <div className={`p-6 rounded-2xl bg-[#12161A] border border-[#252B30] space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40 bg-[#181D22]" />
          <Skeleton className="h-3 w-60 bg-[#181D22]" />
        </div>
        <Skeleton className="h-8 w-28 rounded-xl bg-[#181D22]" />
      </div>
      <div className={`${height} w-full flex items-end justify-between gap-2 pt-6`}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="w-full rounded-t-lg bg-[#181D22]"
            style={{ height: `${Math.floor(25 + ((i * 17) % 65))}%` }}
          />
        ))}
      </div>
    </div>
  );
};
