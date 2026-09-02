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
    return <p className="text-sm text-[#9AA3A0]">Loading profile…</p>;
  }

  return (
    <ProfileView
      userProfile={profile}
      memberSince={memberSince}
      onUpdateProfile={async (updated) => {
        const res = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: updated.name,
            age: updated.age,
            gender: updated.gender,
            heightCm: updated.heightCm,
            weightKg: updated.weightKg,
            bodyFatPercentage: updated.bodyFatPercentage,
          }),
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
