"use client";

import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Header } from "@/components/layout/Header";
import { FoodLoggerModal } from "@/components/modals/FoodLoggerModal";
import { AIWorkoutPlannerModal } from "@/components/modals/AIWorkoutPlannerModal";
import { AINutritionPlannerModal } from "@/components/modals/AINutritionPlannerModal";
import { AIAnalysisModal } from "@/components/modals/AIAnalysisModal";
import { WorkoutCompletionModal } from "@/components/modals/WorkoutCompletionModal";
import { useMockApp } from "@/components/layout/MockAppProvider";
import { tabFromPath } from "@/lib/navigation";
import type { ReactNode } from "react";

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const app = useMockApp();
  const activeTab = tabFromPath(pathname);
  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };
  const hideChrome = pathname.startsWith("/onboarding");

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <div
      id="fitforge-root-layout"
      className="min-h-screen bg-[#0B0D0F] text-[#F5F7F2] flex flex-col md:flex-row antialiased selection:bg-[#B8F34A] selection:text-[#0B0D0F]"
    >
      <Sidebar
        activeTab={activeTab}
        onSelectTab={app.navigateTab}
        userProfile={app.userProfile}
        isCollapsed={app.sidebarCollapsed}
        onToggleCollapse={() => app.setSidebarCollapsed(!app.sidebarCollapsed)}
        onGoToLanding={() => router.push("/")}
        onSignOut={signOut}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-20 md:pb-8">
        <MobileNav
          activeTab={activeTab}
          onSelectTab={app.navigateTab}
          userProfile={app.userProfile}
          onGoToLanding={() => router.push("/")}
          onSignOut={signOut}
        />

        <Header
          userProfile={app.userProfile}
          notifications={app.notifications}
          onMarkAllNotificationsRead={app.markAllNotificationsRead}
          onClearNotification={app.clearNotification}
          onNavigate={app.navigateTab}
          onToggleTheme={app.toggleTheme}
          isDark={app.isDark}
          onOpenQuickAction={(action) => {
            if (action === "ai_coach") app.navigateTab("ai_coach");
            if (action === "workout") app.startWorkout(app.todayWorkout);
            if (action === "nutrition") app.openFoodLogger();
          }}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {app.foodLoggerOpen && (
        <FoodLoggerModal
          defaultMeal={app.foodLoggerMeal}
          onClose={app.closeFoodLogger}
          onLogFood={app.logFood}
        />
      )}

      {app.aiWorkoutPlannerOpen && (
        <AIWorkoutPlannerModal
          userProfile={app.userProfile}
          onClose={() => app.setAiWorkoutPlannerOpen(false)}
          onApplyGeneratedPlan={app.applyAIWorkoutPlan}
        />
      )}

      {app.aiNutritionPlannerOpen && (
        <AINutritionPlannerModal
          userProfile={app.userProfile}
          onClose={() => app.setAiNutritionPlannerOpen(false)}
          onApplyPlan={app.applyAINutritionPlan}
        />
      )}

      {app.aiAnalysisOpen && (
        <AIAnalysisModal
          userProfile={app.userProfile}
          metrics={app.progressHistory}
          composition={app.bodyComposition}
          onClose={() => app.setAiAnalysisOpen(false)}
        />
      )}

      {app.completedWorkoutSummary && (
        <WorkoutCompletionModal
          summary={app.completedWorkoutSummary}
          onClose={app.closeCompletion}
          onViewSummary={() => {
            app.closeCompletion();
            app.navigateTab("workouts");
          }}
        />
      )}
    </div>
  );
}
