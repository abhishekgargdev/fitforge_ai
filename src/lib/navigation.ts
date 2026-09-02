import type { ActiveNavTab } from "@/types";

export const TAB_PATHS: Record<Exclude<ActiveNavTab, "active_workout">, string> = {
  dashboard: "/dashboard",
  workouts: "/workouts",
  exercises: "/exercises",
  nutrition: "/nutrition",
  progress: "/progress",
  ai_coach: "/ai-coach",
  profile: "/profile",
  settings: "/settings",
};

export function pathForTab(tab: ActiveNavTab, workoutId?: string): string {
  if (tab === "active_workout") {
    return `/workouts/active/${workoutId ?? "today"}`;
  }
  return TAB_PATHS[tab];
}

export function tabFromPath(pathname: string): ActiveNavTab {
  if (pathname.startsWith("/workouts/active")) return "active_workout";
  if (pathname.startsWith("/workouts")) return "workouts";
  if (pathname.startsWith("/exercises")) return "exercises";
  if (pathname.startsWith("/nutrition")) return "nutrition";
  if (pathname.startsWith("/progress")) return "progress";
  if (pathname.startsWith("/ai-coach")) return "ai_coach";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/settings")) return "settings";
  return "dashboard";
}
