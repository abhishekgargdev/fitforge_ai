"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type {
  BodyCompositionDetails,
  CompletedWorkoutSummary,
  LoggedMealEntry,
  MealCategory,
  MetricEntry,
  MonthlyMeasurement,
  NotificationItem,
  UserProfile,
  WorkoutSplitSchedule,
  WorkoutTemplate,
} from "@/types";
import { pathForTab } from "@/lib/navigation";
import {
  initialBodyComposition,
  initialLoggedMeals,
  initialMonthlyMeasurements,
  initialNotifications,
  initialProgressHistory,
  initialSplitSchedule,
  initialUserProfile,
  preloadedWorkouts,
} from "@/data/mockData";

export interface MockAppState {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  loggedMeals: LoggedMealEntry[];
  currentSplit: WorkoutSplitSchedule;
  progressHistory: MetricEntry[];
  measurements: MonthlyMeasurement[];
  bodyComposition: BodyCompositionDetails;
  notifications: NotificationItem[];
  isDark: boolean;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  todayWorkout: WorkoutTemplate;
  foodLoggerOpen: boolean;
  foodLoggerMeal: MealCategory;
  aiWorkoutPlannerOpen: boolean;
  aiNutritionPlannerOpen: boolean;
  aiAnalysisOpen: boolean;
  completedWorkoutSummary: CompletedWorkoutSummary | null;
  toggleTheme: () => void;
  startWorkout: (workout: WorkoutTemplate) => void;
  finishWorkout: (summary: CompletedWorkoutSummary) => void;
  logFood: (entry: LoggedMealEntry) => void;
  deleteMealEntry: (id: string) => void;
  openFoodLogger: (meal?: MealCategory) => void;
  closeFoodLogger: () => void;
  setAiWorkoutPlannerOpen: (open: boolean) => void;
  setAiNutritionPlannerOpen: (open: boolean) => void;
  setAiAnalysisOpen: (open: boolean) => void;
  applyAIWorkoutPlan: (generatedPlan: {
    planTitle?: string;
    daysPerWeek?: number;
    weeklySchedule?: WorkoutSplitSchedule["days"];
  }) => void;
  applyAINutritionPlan: (plan: { planTitle?: string; dailyCalories?: number }) => void;
  addMeasurement: (measurement: MonthlyMeasurement) => void;
  markAllNotificationsRead: () => void;
  clearNotification: (id: string) => void;
  resetData: () => void;
  navigateTab: (tab: Parameters<typeof pathForTab>[0]) => void;
  closeCompletion: () => void;
}

const MockAppContext = createContext<MockAppState | null>(null);

export function MockAppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
  const [loggedMeals, setLoggedMeals] = useState<LoggedMealEntry[]>(initialLoggedMeals);
  const [currentSplit, setCurrentSplit] = useState<WorkoutSplitSchedule>(initialSplitSchedule);
  const [progressHistory] = useState<MetricEntry[]>(initialProgressHistory);
  const [measurements, setMeasurements] = useState<MonthlyMeasurement[]>(
    initialMonthlyMeasurements
  );
  const [bodyComposition] = useState<BodyCompositionDetails>(initialBodyComposition);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [isDark, setIsDark] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [foodLoggerOpen, setFoodLoggerOpen] = useState(false);
  const [foodLoggerMeal, setFoodLoggerMeal] = useState<MealCategory>("breakfast");
  const [aiWorkoutPlannerOpen, setAiWorkoutPlannerOpen] = useState(false);
  const [aiNutritionPlannerOpen, setAiNutritionPlannerOpen] = useState(false);
  const [aiAnalysisOpen, setAiAnalysisOpen] = useState(false);
  const [completedWorkoutSummary, setCompletedWorkoutSummary] =
    useState<CompletedWorkoutSummary | null>(null);

  const todayWorkout = currentSplit.days[0]?.workout ?? preloadedWorkouts[0];

  const navigateTab = useCallback(
    (tab: Parameters<typeof pathForTab>[0]) => {
      router.push(pathForTab(tab));
    },
    [router]
  );

  const startWorkout = useCallback(
    (workout: WorkoutTemplate) => {
      router.push(`/workouts/active/${workout.id}`);
    },
    [router]
  );

  const finishWorkout = useCallback(
    (summary: CompletedWorkoutSummary) => {
      setCompletedWorkoutSummary(summary);
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: "Workout Completed!",
        message: `You crushed ${summary.workoutName} with ${summary.totalVolumeKg}kg total volume.`,
        timestamp: "Just now",
        read: false,
        type: "workout",
      };
      setNotifications((prev) => [newNotif, ...prev]);
      router.push("/workouts");
    },
    [router]
  );

  const value = useMemo<MockAppState>(
    () => ({
      userProfile,
      setUserProfile,
      loggedMeals,
      currentSplit,
      progressHistory,
      measurements,
      bodyComposition,
      notifications,
      isDark,
      sidebarCollapsed,
      setSidebarCollapsed,
      todayWorkout,
      foodLoggerOpen,
      foodLoggerMeal,
      aiWorkoutPlannerOpen,
      aiNutritionPlannerOpen,
      aiAnalysisOpen,
      completedWorkoutSummary,
      toggleTheme: () => setIsDark((d) => !d),
      startWorkout,
      finishWorkout,
      logFood: (entry) => setLoggedMeals((prev) => [entry, ...prev]),
      deleteMealEntry: (id) => setLoggedMeals((prev) => prev.filter((m) => m.id !== id)),
      openFoodLogger: (meal = "breakfast") => {
        setFoodLoggerMeal(meal);
        setFoodLoggerOpen(true);
      },
      closeFoodLogger: () => setFoodLoggerOpen(false),
      setAiWorkoutPlannerOpen,
      setAiNutritionPlannerOpen,
      setAiAnalysisOpen,
      applyAIWorkoutPlan: (generatedPlan) => {
        setAiWorkoutPlannerOpen(false);
        if (generatedPlan.weeklySchedule && generatedPlan.weeklySchedule.length > 0) {
          setCurrentSplit({
            id: `split-${Date.now()}`,
            title: generatedPlan.planTitle || "AI Personalized Hypertrophy Split",
            daysPerWeek: generatedPlan.daysPerWeek || 4,
            days: generatedPlan.weeklySchedule,
          });
        }
        router.push("/workouts");
      },
      applyAINutritionPlan: (plan) => {
        setAiNutritionPlannerOpen(false);
        setNotifications((prev) => [
          {
            id: `notif-${Date.now()}`,
            title: "New Meal Plan Applied",
            message: `${plan.planTitle ?? "Meal plan"} (${plan.dailyCalories ?? 0} kcal) is now your primary target.`,
            timestamp: "Just now",
            read: false,
            type: "nutrition",
          },
          ...prev,
        ]);
        router.push("/nutrition");
      },
      addMeasurement: (newM) => setMeasurements((prev) => [newM, ...prev]),
      markAllNotificationsRead: () =>
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
      clearNotification: (id) => setNotifications((prev) => prev.filter((n) => n.id !== id)),
      resetData: () => {
        setUserProfile(initialUserProfile);
        setLoggedMeals(initialLoggedMeals);
        setCurrentSplit(initialSplitSchedule);
        setMeasurements(initialMonthlyMeasurements);
        setNotifications(initialNotifications);
      },
      navigateTab,
      closeCompletion: () => setCompletedWorkoutSummary(null),
    }),
    [
      userProfile,
      loggedMeals,
      currentSplit,
      progressHistory,
      measurements,
      bodyComposition,
      notifications,
      isDark,
      sidebarCollapsed,
      todayWorkout,
      foodLoggerOpen,
      foodLoggerMeal,
      aiWorkoutPlannerOpen,
      aiNutritionPlannerOpen,
      aiAnalysisOpen,
      completedWorkoutSummary,
      startWorkout,
      finishWorkout,
      navigateTab,
      router,
    ]
  );

  return <MockAppContext.Provider value={value}>{children}</MockAppContext.Provider>;
}

export function useMockApp() {
  const ctx = useContext(MockAppContext);
  if (!ctx) {
    throw new Error("useMockApp must be used within MockAppProvider");
  }
  return ctx;
}
