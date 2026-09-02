"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.user?.name) setName(json.data.user.name);
      })
      .catch(() => undefined);
  }, []);

  return (
    <OnboardingFlow
      initialProfile={{ name }}
      onCompleteOnboarding={() => {
        router.push("/dashboard");
        router.refresh();
      }}
      onCancelToLanding={() => router.push("/")}
    />
  );
}
