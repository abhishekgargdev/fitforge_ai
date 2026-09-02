import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  ActiveNavTab,
  AppMode,
  LoggedMealEntry,
  WorkoutTemplate,
  WorkoutSplitSchedule,
  MetricEntry,
  MonthlyMeasurement,
  BodyCompositionDetails,
  NotificationItem,
  MealCategory,
  CompletedWorkoutSummary,
} from './types';
import {
  initialUserProfile,
  preloadedWorkouts,
  initialSplitSchedule,
  initialLoggedMeals,
  initialProgressHistory,
  initialMonthlyMeasurements,
  initialBodyComposition,
  initialNotifications,
} from './data/mockData';

// Landing, Auth & Onboarding Views
import { LandingPage } from './components/auth/LandingPage';
import { AuthPage } from './components/auth/AuthPage';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';

// Layout
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { Header } from './components/layout/Header';

// Views
import { DashboardView } from './components/views/DashboardView';
import { WorkoutsView } from './components/views/WorkoutsView';
import { ActiveWorkoutTracker } from './components/views/ActiveWorkoutTracker';
import { ExercisesView } from './components/views/ExercisesView';
import { NutritionView } from './components/views/NutritionView';
import { ProgressView } from './components/views/ProgressView';
import { AICoachView } from './components/views/AICoachView';
import { ProfileView } from './components/views/ProfileView';
import { SettingsView } from './components/views/SettingsView';

// Modals
import { FoodLoggerModal } from './components/modals/FoodLoggerModal';
import { AIWorkoutPlannerModal } from './components/modals/AIWorkoutPlannerModal';
import { AINutritionPlannerModal } from './components/modals/AINutritionPlannerModal';
import { AIAnalysisModal } from './components/modals/AIAnalysisModal';
import { WorkoutCompletionModal } from './components/modals/WorkoutCompletionModal';

export default function App() {
  // Application Mode: 'landing' | 'auth' | 'onboarding' | 'app'
  const [appMode, setAppMode] = useState<AppMode>(() => {
    const saved = localStorage.getItem('fitforge_app_mode');
    return (saved as AppMode) || 'landing';
  });

  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');

  // Global State with LocalStorage persistence
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Core Data States
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('fitforge_user_profile');
    return saved ? JSON.parse(saved) : initialUserProfile;
  });

  const [loggedMeals, setLoggedMeals] = useState<LoggedMealEntry[]>(() => {
    const saved = localStorage.getItem('fitforge_logged_meals');
    return saved ? JSON.parse(saved) : initialLoggedMeals;
  });

  const [currentSplit, setCurrentSplit] = useState<WorkoutSplitSchedule>(() => {
    const saved = localStorage.getItem('fitforge_split_schedule');
    return saved ? JSON.parse(saved) : initialSplitSchedule;
  });

  const [progressHistory, setProgressHistory] = useState<MetricEntry[]>(() => {
    const saved = localStorage.getItem('fitforge_progress_history');
    return saved ? JSON.parse(saved) : initialProgressHistory;
  });

  const [measurements, setMeasurements] = useState<MonthlyMeasurement[]>(() => {
    const saved = localStorage.getItem('fitforge_measurements');
    return saved ? JSON.parse(saved) : initialMonthlyMeasurements;
  });

  const [bodyComposition, setBodyComposition] = useState<BodyCompositionDetails>(() => {
    const saved = localStorage.getItem('fitforge_body_comp');
    return saved ? JSON.parse(saved) : initialBodyComposition;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('fitforge_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  // Active workout session state
  const [activeSessionWorkout, setActiveSessionWorkout] = useState<WorkoutTemplate | null>(null);
  const [completedWorkoutSummary, setCompletedWorkoutSummary] = useState<CompletedWorkoutSummary | null>(null);

  // Modals state
  const [foodLoggerOpen, setFoodLoggerOpen] = useState(false);
  const [foodLoggerMeal, setFoodLoggerMeal] = useState<MealCategory>('breakfast');
  const [aiWorkoutPlannerOpen, setAiWorkoutPlannerOpen] = useState(false);
  const [aiNutritionPlannerOpen, setAiNutritionPlannerOpen] = useState(false);
  const [aiAnalysisOpen, setAiAnalysisOpen] = useState(false);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('fitforge_app_mode', appMode);
  }, [appMode]);

  useEffect(() => {
    localStorage.setItem('fitforge_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('fitforge_logged_meals', JSON.stringify(loggedMeals));
  }, [loggedMeals]);

  useEffect(() => {
    localStorage.setItem('fitforge_split_schedule', JSON.stringify(currentSplit));
  }, [currentSplit]);

  useEffect(() => {
    localStorage.setItem('fitforge_progress_history', JSON.stringify(progressHistory));
  }, [progressHistory]);

  useEffect(() => {
    localStorage.setItem('fitforge_measurements', JSON.stringify(measurements));
  }, [measurements]);

  // Handler functions
  const handleStartWorkout = (workout: WorkoutTemplate) => {
    setActiveSessionWorkout(workout);
  };

  const handleFinishWorkout = (summary: CompletedWorkoutSummary) => {
    setActiveSessionWorkout(null);
    setCompletedWorkoutSummary(summary);

    // Add notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Workout Completed!',
      message: `You crushed ${summary.workoutName} with ${summary.totalVolumeKg}kg total volume.`,
      timestamp: 'Just now',
      read: false,
      type: 'workout',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleLogFood = (entry: LoggedMealEntry) => {
    setLoggedMeals((prev) => [entry, ...prev]);
  };

  const handleDeleteMealEntry = (id: string) => {
    setLoggedMeals((prev) => prev.filter((m) => m.id !== id));
  };

  const handleOpenFoodLogger = (meal: MealCategory = 'breakfast') => {
    setFoodLoggerMeal(meal);
    setFoodLoggerOpen(true);
  };

  const handleApplyAIWorkoutPlan = (generatedPlan: any) => {
    setAiWorkoutPlannerOpen(false);
    if (generatedPlan.weeklySchedule && generatedPlan.weeklySchedule.length > 0) {
      setCurrentSplit({
        id: `split-${Date.now()}`,
        title: generatedPlan.planTitle || 'AI Personalized Hypertrophy Split',
        daysPerWeek: generatedPlan.daysPerWeek || 4,
        days: generatedPlan.weeklySchedule,
      });
    }
    setActiveTab('workouts');
  };

  const handleApplyAINutritionPlan = (plan: any) => {
    setAiNutritionPlannerOpen(false);
    // Add success notification
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'New Meal Plan Applied',
      message: `${plan.planTitle} (${plan.dailyCalories} kcal) is now your primary target.`,
      timestamp: 'Just now',
      read: false,
      type: 'nutrition',
    };
    setNotifications((prev) => [notif, ...prev]);
    setActiveTab('nutrition');
  };

  const handleAddMeasurement = (newM: MonthlyMeasurement) => {
    setMeasurements((prev) => [newM, ...prev]);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleResetData = () => {
    localStorage.clear();
    setUserProfile(initialUserProfile);
    setLoggedMeals(initialLoggedMeals);
    setCurrentSplit(initialSplitSchedule);
    setProgressHistory(initialProgressHistory);
    setMeasurements(initialMonthlyMeasurements);
    setBodyComposition(initialBodyComposition);
    setNotifications(initialNotifications);
  };

  const handleCompleteOnboarding = (configuredProfile: UserProfile) => {
    setUserProfile(configuredProfile);
    setAppMode('app');
    setActiveTab('dashboard');

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Welcome to FitForge AI!',
      message: 'Your personalized hypertrophy plan and bio-metrics baseline are calibrated.',
      timestamp: 'Just now',
      read: false,
      type: 'ai',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // View routing based on appMode
  if (appMode === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => {
          setAuthInitialMode('register');
          setAppMode('onboarding');
        }}
        onLogin={() => {
          setAuthInitialMode('login');
          setAppMode('auth');
        }}
        onExploreDemo={() => {
          setAppMode('app');
          setActiveTab('dashboard');
        }}
      />
    );
  }

  if (appMode === 'auth') {
    return (
      <AuthPage
        initialMode={authInitialMode}
        onLoginSuccess={(userData) => {
          if (userData) {
            setUserProfile((prev) => ({
              ...prev,
              name: userData.name || prev.name,
              email: userData.email || prev.email,
            }));
          }
          setAppMode('app');
          setActiveTab('dashboard');
        }}
        onStartOnboarding={() => {
          setAppMode('onboarding');
        }}
        onBackToLanding={() => {
          setAppMode('landing');
        }}
      />
    );
  }

  if (appMode === 'onboarding') {
    return (
      <OnboardingFlow
        initialProfile={userProfile}
        onCompleteOnboarding={handleCompleteOnboarding}
        onCancelToLanding={() => setAppMode('landing')}
      />
    );
  }

  const todayWorkout = currentSplit.days[0]?.workout || preloadedWorkouts[0];

  return (
    <div
      id="fitforge-root-layout"
      className="min-h-screen bg-[#0B0D0F] text-[#F5F7F2] flex flex-col md:flex-row antialiased selection:bg-[#B8F34A] selection:text-[#0B0D0F]"
    >
      {/* Desktop Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        userProfile={userProfile}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onGoToLanding={() => setAppMode('landing')}
        onSignOut={() => {
          setAuthInitialMode('login');
          setAppMode('auth');
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-20 md:pb-8">
        {/* Mobile Header */}
        <MobileNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          userProfile={userProfile}
          onGoToLanding={() => setAppMode('landing')}
          onSignOut={() => {
            setAuthInitialMode('login');
            setAppMode('auth');
          }}
        />

        {/* Global Desktop Header */}
        <Header
          userProfile={userProfile}
          notifications={notifications}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onClearNotification={handleClearNotification}
          onNavigate={setActiveTab}
          onToggleTheme={() => setIsDark(!isDark)}
          isDark={isDark}
          onOpenQuickAction={(action) => {
            if (action === 'ai_coach') setActiveTab('ai_coach');
            if (action === 'workout') handleStartWorkout(todayWorkout);
            if (action === 'nutrition') handleOpenFoodLogger();
          }}
        />

        {/* Main Content Container */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {/* Active Workout Screen takes precedence if active */}
          {activeSessionWorkout ? (
            <ActiveWorkoutTracker
              workout={activeSessionWorkout}
              onFinishWorkout={handleFinishWorkout}
              onCancel={() => setActiveSessionWorkout(null)}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  userProfile={userProfile}
                  loggedMeals={loggedMeals}
                  todayWorkout={todayWorkout}
                  progressHistory={progressHistory}
                  latestComposition={bodyComposition}
                  onNavigate={setActiveTab}
                  onStartWorkout={handleStartWorkout}
                  onOpenFoodLogger={() => handleOpenFoodLogger('breakfast')}
                  onOpenAIPlanner={() => setAiNutritionPlannerOpen(true)}
                  onOpenAIAnalysis={() => setAiAnalysisOpen(true)}
                />
              )}

              {activeTab === 'workouts' && (
                <WorkoutsView
                  currentSplit={currentSplit}
                  onStartWorkout={handleStartWorkout}
                  onOpenAIPlanner={() => setAiWorkoutPlannerOpen(true)}
                  onNavigate={setActiveTab}
                />
              )}

              {activeTab === 'exercises' && (
                <ExercisesView
                  onStartWithExercise={() => {
                    handleStartWorkout(todayWorkout);
                  }}
                />
              )}

              {activeTab === 'nutrition' && (
                <NutritionView
                  loggedMeals={loggedMeals}
                  onOpenFoodLogger={handleOpenFoodLogger}
                  onOpenAIPlanner={() => setAiNutritionPlannerOpen(true)}
                  onDeleteMealEntry={handleDeleteMealEntry}
                />
              )}

              {activeTab === 'progress' && (
                <ProgressView
                  userProfile={userProfile}
                  metrics={progressHistory}
                  measurements={measurements}
                  composition={bodyComposition}
                  onOpenAIAnalysis={() => setAiAnalysisOpen(true)}
                  onAddMeasurement={handleAddMeasurement}
                />
              )}

              {activeTab === 'ai_coach' && (
                <AICoachView userProfile={userProfile} />
              )}

              {activeTab === 'profile' && (
                <ProfileView
                  userProfile={userProfile}
                  onUpdateProfile={setUserProfile}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  isDark={isDark}
                  onToggleTheme={() => setIsDark(!isDark)}
                  onResetData={handleResetData}
                  onRestartOnboarding={() => setAppMode('onboarding')}
                  onGoToLanding={() => setAppMode('landing')}
                  onSignOut={() => {
                    setAuthInitialMode('login');
                    setAppMode('auth');
                  }}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Modals */}
      {foodLoggerOpen && (
        <FoodLoggerModal
          defaultMeal={foodLoggerMeal}
          onClose={() => setFoodLoggerOpen(false)}
          onLogFood={handleLogFood}
        />
      )}

      {aiWorkoutPlannerOpen && (
        <AIWorkoutPlannerModal
          userProfile={userProfile}
          onClose={() => setAiWorkoutPlannerOpen(false)}
          onApplyGeneratedPlan={handleApplyAIWorkoutPlan}
        />
      )}

      {aiNutritionPlannerOpen && (
        <AINutritionPlannerModal
          userProfile={userProfile}
          onClose={() => setAiNutritionPlannerOpen(false)}
          onApplyPlan={handleApplyAINutritionPlan}
        />
      )}

      {aiAnalysisOpen && (
        <AIAnalysisModal
          userProfile={userProfile}
          metrics={progressHistory}
          composition={bodyComposition}
          onClose={() => setAiAnalysisOpen(false)}
        />
      )}

      {completedWorkoutSummary && (
        <WorkoutCompletionModal
          summary={completedWorkoutSummary}
          onClose={() => setCompletedWorkoutSummary(null)}
          onViewSummary={() => {
            setCompletedWorkoutSummary(null);
            setActiveTab('workouts');
          }}
        />
      )}
    </div>
  );
}
