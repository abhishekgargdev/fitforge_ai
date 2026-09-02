"use client";

import { useRouter } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { useMockApp } from "@/components/layout/MockAppProvider";

export default function OnboardingPage() {
  const router = useRouter();
  const { userProfile, setUserProfile } = useMockApp();

  return (
    <OnboardingFlow
      initialProfile={userProfile}
      onCompleteOnboarding={(profile) => {
        setUserProfile(profile);
        router.push("/dashboard");
      }}
      onCancelToLanding={() => router.push("/")}
    />
  );
}
