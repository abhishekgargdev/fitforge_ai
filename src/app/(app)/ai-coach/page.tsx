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
    return <div className="text-sm text-[#9AA3A0]">Loading coach…</div>;
  }

  return <AICoachView userProfile={profile} />;
}
