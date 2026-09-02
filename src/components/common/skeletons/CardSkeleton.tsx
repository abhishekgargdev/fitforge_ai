import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface CardSkeletonProps {
  className?: string;
  count?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  className = "",
  count = 1,
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl bg-[#12161A] border border-[#252B30] space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24 bg-[#181D22]" />
            <Skeleton className="h-7 w-7 rounded-xl bg-[#181D22]" />
          </div>
          <Skeleton className="h-8 w-20 bg-[#181D22]" />
          <Skeleton className="h-3 w-32 bg-[#181D22]" />
        </div>
      ))}
    </div>
  );
};
