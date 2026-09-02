import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  className?: string;
  rows?: number;
  cols?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  className = "",
  rows = 5,
  cols = 4,
}) => {
  return (
    <div className={`rounded-2xl bg-[#12161A] border border-[#252B30] overflow-hidden ${className}`}>
      <div className="p-4 border-b border-[#252B30] grid grid-cols-4 gap-4">
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} className="h-4 w-20 bg-[#181D22]" />
        ))}
      </div>
      <div className="divide-y divide-[#252B30]">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 grid grid-cols-4 gap-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-4 w-full bg-[#181D22]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
