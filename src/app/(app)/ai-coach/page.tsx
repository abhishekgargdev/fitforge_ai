"use client";

import { useEffect, useState } from "react";
import { AICoachView } from "@/components/views/AICoachView";
import type { UserProfile } from "@/types";

export default function AICoachPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.profile) setProfile(json.data.profile);
      })
      .catch(() => undefined);
  }, []);

  if (!profile) {
    return (
      <div className="bg-[#12161A] border border-[#252B30] rounded-2xl h-[calc(100vh-140px)] p-6 space-y-4 animate-pulse">
        <div className="h-10 bg-[#181D22] rounded-xl w-48" />
        <div className="h-64 bg-[#181D22] rounded-2xl w-full" />
      </div>
    );
  }

  return <AICoachView userProfile={profile} />;
}
