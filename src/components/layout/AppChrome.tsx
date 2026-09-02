"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Header } from "@/components/layout/Header";
import { FoodLoggerModal } from "@/components/modals/FoodLoggerModal";
import { tabFromPath, pathForTab } from "@/lib/navigation";
import type { NotificationItem, UserProfile } from "@/types";

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const activeTab = tabFromPath(pathname);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [foodLoggerOpen, setFoodLoggerOpen] = useState(false);
  const [notifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.profile) {
          setProfile(json.data.profile);
          setIsDark(json.data.profile.theme !== "light");
        }
      })
      .catch(() => undefined);
  }, [pathname]);

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const hideChrome = pathname.startsWith("/onboarding");
  if (hideChrome) {
    return <>{children}</>;
  }

  const navigateTab = (tab: Parameters<typeof pathForTab>[0]) => {
    router.push(pathForTab(tab));
  };

  const headerProfile = profile || {
    name: "Athlete",
    email: "",
    age: 0,
    gender: "other" as const,
    heightCm: 0,
    weightKg: 0,
    bodyFatPercentage: 0,
    fitnessGoal: "general_health" as const,
    experienceLevel: "beginner" as const,
    trainingDaysPerWeek: 0,
    workoutDurationMinutes: 0,
    availableEquipment: [],
    focusMuscles: [],
    dietPreference: "other" as const,
    mealsPerDay: 3,
    foodPreferences: "",
    allergies: "",
    unitSystem: "metric" as const,
    theme: "dark" as const,
  };

  return (
    <div
      id="fitforge-root-layout"
      className="min-h-screen bg-[#0B0D0F] text-[#F5F7F2] flex flex-col md:flex-row antialiased selection:bg-[#B8F34A] selection:text-[#0B0D0F]"
    >
      <Sidebar
        activeTab={activeTab}
        onSelectTab={navigateTab}
        userProfile={headerProfile}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onGoToLanding={() => router.push("/")}
        onSignOut={signOut}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-20 md:pb-8">
        <MobileNav
          activeTab={activeTab}
          onSelectTab={navigateTab}
          userProfile={headerProfile}
          onGoToLanding={() => router.push("/")}
          onSignOut={signOut}
        />

        <Header
          userProfile={headerProfile}
          notifications={notifications}
          onMarkAllNotificationsRead={() => undefined}
          onClearNotification={() => undefined}
          onNavigate={navigateTab}
          onToggleTheme={() => setIsDark((value) => !value)}
          isDark={isDark}
          onOpenQuickAction={(action) => {
            if (action === "ai_coach") navigateTab("ai_coach");
            if (action === "workout") navigateTab("workouts");
            if (action === "nutrition") setFoodLoggerOpen(true);
          }}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {foodLoggerOpen && (
        <FoodLoggerModal
          onClose={() => setFoodLoggerOpen(false)}
          onLogFood={() => setFoodLoggerOpen(false)}
        />
      )}
    </div>
  );
}
