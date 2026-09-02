"use client";

import { useRouter } from "next/navigation";
import { SettingsView } from "@/components/views/SettingsView";
import { useMockApp } from "@/components/layout/MockAppProvider";

export default function SettingsPage() {
  const router = useRouter();
  const app = useMockApp();

  return (
    <SettingsView
      isDark={app.isDark}
      onToggleTheme={app.toggleTheme}
      onResetData={app.resetData}
      onRestartOnboarding={() => router.push("/onboarding")}
      onGoToLanding={() => router.push("/")}
      onSignOut={() => router.push("/login")}
    />
  );
}
