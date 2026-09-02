import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ListSkeletonProps {
  className?: string;
  count?: number;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({
  className = "",
  count = 4,
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-xl bg-[#12161A] border border-[#252B30] flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Skeleton className="w-10 h-10 rounded-xl bg-[#181D22] shrink-0" />
            <div className="space-y-2 flex-1 min-w-0">
              <Skeleton className="h-4 w-1/3 bg-[#181D22]" />
              <Skeleton className="h-3 w-1/2 bg-[#181D22]" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-lg bg-[#181D22]" />
        </div>
      ))}
    </div>
  );
};
