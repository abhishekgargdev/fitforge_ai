"use client";

import { useRouter } from "next/navigation";
import { SettingsView } from "@/components/views/SettingsView";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <SettingsView
      onRestartOnboarding={() => {
        router.push("/onboarding");
        router.refresh();
      }}
      onGoToLanding={() => router.push("/")}
      onSignOut={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      }}
    />
  );
}
