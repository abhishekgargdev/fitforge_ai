"use client";

import { AICoachView } from "@/components/views/AICoachView";
import { useMockApp } from "@/components/layout/MockAppProvider";

export default function AICoachPage() {
  const { userProfile } = useMockApp();
  return <AICoachView userProfile={userProfile} />;
}
