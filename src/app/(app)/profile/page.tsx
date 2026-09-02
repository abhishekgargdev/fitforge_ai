"use client";

import { useEffect, useState } from "react";
import { ProfileView } from "@/components/views/ProfileView";
import type { UserProfile } from "@/types";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || "Unable to load profile.");
        setProfile(json.data.profile);
        setMemberSince(json.data.memberSince);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load profile."));
  }, []);

  if (error) {
    return <p className="text-sm text-[#F05D5E]">{error}</p>;
  }
  if (!profile) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-[#12161A] border border-[#252B30] h-28 animate-pulse" />
          ))}
        </div>
        <div className="p-6 rounded-2xl bg-[#12161A] border border-[#252B30] h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <ProfileView
      userProfile={profile}
      memberSince={memberSince}
      onUpdateProfile={async (updated) => {
        const res = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error?.message || "Unable to save profile.");
        }
        setProfile(json.data.profile);
      }}
    />
  );
}
