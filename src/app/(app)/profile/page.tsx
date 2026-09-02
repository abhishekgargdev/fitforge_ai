"use client";

import { ProfileView } from "@/components/views/ProfileView";
import { useMockApp } from "@/components/layout/MockAppProvider";

export default function ProfilePage() {
  const { userProfile, setUserProfile } = useMockApp();
  return <ProfileView userProfile={userProfile} onUpdateProfile={setUserProfile} />;
}
