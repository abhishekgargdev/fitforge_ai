import React from "react";
import { ListSkeleton } from "@/components/common/skeletons";

export default function AICoachLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="p-6 rounded-2xl bg-[#12161A] border border-[#252B30]">
        <ListSkeleton count={4} />
      </div>
    </div>
  );
}
