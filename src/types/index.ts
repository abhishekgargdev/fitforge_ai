/**
 * Shared domain contracts for API routes and UI.
 * Phase 0 named types are aliased onto the UI export shapes (the UI is the
 * current source of truth). Module phases should extend these, not fork them.
 */

export type DataOrigin = "MEASURED" | "CALCULATED" | "AI_RECOMMENDATION" | "WORKOUT_CHECKIN";

export type FitnessGoal =
  | "lose_fat"
  | "build_muscle"
  | "maintain"
  | "improve_fitness"
  | "strength"
  | "general_health";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export type EquipmentType =
  | "full_gym"
  | "dumbbells"
  | "barbell"
  | "machines"
  | "resistance_bands"
  | "bodyweight"
  | "home_gym";

export type DietPreference =
  | "non_vegetarian"
  | "vegetarian"
  | "vegan"
  | "pescatarian"
  | "keto"
  | "other";

export type DietType =
  | "balanced"
  | "high_protein"
  | "low_carb"
  | "keto"
  | "vegetarian"
  | "vegan"
  | "mediterranean";

export type MealCategory = "breakfast" | "lunch" | "dinner" | "snack";

export type MuscleGroup =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Arms"
  | "Biceps"
  | "Triceps"
  | "Legs"
  | "Quads"
  | "Hamstrings"
  | "Glutes"
  | "Calves"
  | "Core"
  | "Cardio";

/** UI profile shape (onboarding + settings). Phase 0 `Profile` aliases this. */
export interface UserProfile {
  name: string;
  email: string;
  age: number;
  gender: "male" | "female" | "other";
  heightCm: number;
  weightKg: number;
  bodyFatPercentage: number;
  fitnessGoal: FitnessGoal;
  experienceLevel: ExperienceLevel;
  trainingDaysPerWeek: number;
  workoutDurationMinutes: number;
  availableEquipment: EquipmentType[];
  focusMuscles: string[];
  dietPreference: DietPreference;
  mealsPerDay: number;
  foodPreferences: string;
  allergies: string;
  unitSystem: "metric" | "imperial";
  theme: "dark" | "light" | "system";
  planMode?: "ai" | "manual";
}

export type Profile = UserProfile;

export type AiPersona = "scientific" | "motivational" | "strict";

export interface UserSettings {
  unitSystem: "metric" | "imperial";
  theme: "dark" | "light" | "system";
  aiPersona: AiPersona;
  audioChimes: boolean;
  planMode: "ai" | "manual";
}

export interface User {
  id: string;
  name: string;
  email: string;
  onboardingComplete: boolean;
}

export interface FitnessGoalRecord {
  id: string;
  userId: string;
  fitnessGoal: FitnessGoal;
  targetWeightKg: number;
  focusMuscles: string[];
  experienceLevel: ExperienceLevel;
  trainingDaysPerWeek: number;
  workoutDurationMinutes: number;
  availableEquipment: EquipmentType[];
}

export interface BodyMeasurementRecord {
  id: string;
  userId: string;
  date: string;
  month: string;
  weightKg: number;
  bodyFatPercentage: number;
  muscleMassKg: number;
  bmi: number;
  measuredBmi?: number;
  visceralFat: number;
  bodyAge: number;
  restingMetabolismKcal: number;
  trunkFatPercentage: number;
  trunkMusclePercentage: number;
  armsFatPercentage: number;
  armsMusclePercentage: number;
  legsFatPercentage: number;
  legsMusclePercentage: number;
  chestCm: number;
  waistCm: number;
  hipsCm: number;
  bicepsCm: number;
  thighsCm: number;
  calvesCm: number;
  shouldersCm: number;
  neckCm: number;
  origin: DataOrigin;
}

export interface MetricEntry {
  date: string;
  weightKg: number;
  bodyFatPercentage: number;
  muscleMassKg: number;
  bmi: number;
  visceralFat?: number;
  bodyAge?: number;
  restingMetabolismKcal?: number;
}

export interface MonthlyMeasurement {
  id: string;
  month: string;
  date: string;
  chestCm: number;
  waistCm: number;
  hipsCm: number;
  bicepsCm: number;
  thighsCm: number;
  calvesCm: number;
  shouldersCm: number;
  neckCm: number;
}

export type BodyMeasurement = MonthlyMeasurement;

export interface BodyCompositionDetails {
  date: string;
  overall: {
    weightKg: number;
    bmi: number;
    bodyFatPercentage: number;
    visceralFat: number;
    bodyAge: number;
    restingMetabolismKcal: number;
  };
  trunk: {
    fatPercentage: number;
    musclePercentage: number;
  };
  arms: {
    fatPercentage: number;
    musclePercentage: number;
  };
  legs: {
    fatPercentage: number;
    musclePercentage: number;
  };
}

export interface Exercise {
  id: string;
  name: string;
  bodyPart?: string;
  targetMuscle: MuscleGroup | string;
  primaryMuscles?: string[];
  secondaryMuscles: (MuscleGroup | string)[];
  equipment: EquipmentType | string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  exerciseType: "Strength" | "Hypertrophy" | "Cardio" | "Mobility";
  category?: string;
  imageUrl: string;
  gifUrl?: string;
  videoThumbUrl?: string;
  instructions: string[];
  musclesWorkedVisual?: {
    primary: string[];
    secondary: string[];
  };
  commonMistakes: string[];
  tips: string[];
}

export interface ActiveWorkoutSet {
  setNumber: number;
  targetWeightKg: number;
  targetReps: number;
  actualWeightKg: number;
  actualReps: number;
  rpe?: number;
  completed: boolean;
}

export interface ActiveWorkoutExercise {
  exercise: Exercise;
  sets: ActiveWorkoutSet[];
  restSeconds: number;
  aiNote?: string;
}

export interface WorkoutExerciseItem {
  exerciseId: string;
  exerciseName: string;
  targetMuscle: MuscleGroup;
  sets: number;
  reps: string;
  restSeconds: number;
  aiNote?: string;
  equipment: string;
  targetWeightKg?: number;
  imageUrl?: string;
  difficulty?: Exercise["difficulty"];
  instructions?: string[];
  tips?: string[];
  locked?: boolean;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  durationMinutes: number;
  exercises: WorkoutExerciseItem[];
  lastPerformed?: string;
  completionRate?: number;
  category: "Upper" | "Lower" | "Push" | "Pull" | "Full Body" | "Cardio";
  targetMuscles?: MuscleGroup[];
}

export type WorkoutPlan = WorkoutTemplate;

export interface WorkoutSplitDay {
  dayName: string;
  /** Alias used by some UI; same value as dayName. */
  day?: string;
  focus: string;
  isRestDay: boolean;
  locked?: boolean;
  workout?: WorkoutTemplate;
}

export interface WorkoutSplitSchedule {
  id: string;
  title: string;
  daysPerWeek: number;
  planMode?: "ai" | "manual";
  nextPlanGenerationDate?: string;
  days: WorkoutSplitDay[];
}

export interface RecoveryItem {
  id?: string;
  type: "shower" | "stretch" | "mobility" | "supplement" | "meditation" | "sleep" | "hydration";
  title: string;
  description: string;
  source?: "ai" | "manual";
}

export interface RecoveryPlan {
  id: string;
  userId: string;
  date: string;
  items: RecoveryItem[];
}

export interface CompletedWorkoutSummary {
  id: string;
  workoutName: string;
  date: string;
  durationMinutes: number;
  totalVolumeKg: number;
  totalSets: number;
  totalExercises: number;
  caloriesBurnedEstimate: number;
  personalRecords: string[];
  volumeChangeVsPreviousPercentage: number;
  aiSummary: string;
}

export type WorkoutSession = CompletedWorkoutSummary;

export interface FoodItem {
  id: string;
  name: string;
  servingSize: string;
  servingWeightGrams: number;
  caloriesKcal: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  category: "Protein" | "Carb" | "Fat" | "Produce" | "Snack" | "Dairy";
  isFavorite?: boolean;
}

export interface LoggedMealEntry {
  id: string;
  foodId?: string;
  name: string;
  serving?: string;
  mealCategory: MealCategory;
  mealType?: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  grams?: number;
  caloriesKcal: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number;
  timeLogged: string;
  source?: "manual" | "ai_chat" | "ai_image" | "barcode";
}

export type FoodLog = LoggedMealEntry;

export interface DailyNutritionTarget {
  targetCaloriesKcal: number;
  targetProteinGrams: number;
  targetCarbsGrams: number;
  targetFatGrams: number;
  targetFiberGrams: number;
}

export interface AIMealPlanMeal {
  mealType: "Breakfast" | "Lunch" | "Snack" | "Dinner";
  title: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  aiTip: string;
}

export interface AIMealPlan {
  id: string;
  generatedAt: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: AIMealPlanMeal[];
}

export type AIPlan = AIMealPlan;

export interface AIChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  dataOrigin?: DataOrigin;
  origin?: DataOrigin;
  actionSuggestions?: {
    label: string;
    actionType: "navigate" | "open_modal" | "log_food" | "start_workout";
    payload?: string;
  }[];
}

export type ChatMessage = AIChatMessage;

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "workout" | "progress" | "ai" | "nutrition";
  timestamp: string;
  read: boolean;
}

export type ActiveNavTab =
  | "dashboard"
  | "workouts"
  | "active_workout"
  | "exercises"
  | "nutrition"
  | "progress"
  | "recovery"
  | "ai_coach"
  | "profile"
  | "settings";

export type AppMode = "landing" | "auth" | "onboarding" | "app";
