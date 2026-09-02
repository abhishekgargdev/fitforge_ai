import type { UserProfile, UserSettings } from "@/types";

type LeanUser = {
  name: string;
  email: string;
  createdAt?: Date;
};

type LeanProfile = {
  age: number;
  gender: UserProfile["gender"];
  heightCm: number;
  weightKg: number;
  bodyFatPercentage: number;
  dietPreference: UserProfile["dietPreference"];
  mealsPerDay: number;
  foodPreferences?: string;
  allergies?: string;
  unitSystem?: UserProfile["unitSystem"];
  theme?: UserProfile["theme"];
  aiPersona?: UserSettings["aiPersona"];
  audioChimes?: boolean;
  planMode?: "ai" | "manual";
};

type LeanGoal = {
  fitnessGoal: UserProfile["fitnessGoal"];
  experienceLevel: UserProfile["experienceLevel"];
  trainingDaysPerWeek: number;
  workoutDurationMinutes: number;
  availableEquipment: UserProfile["availableEquipment"];
  focusMuscles?: string[];
};

export function assembleUserProfile(
  user: LeanUser,
  profile: LeanProfile,
  goal: LeanGoal
): UserProfile {
  return {
    name: user.name,
    email: user.email,
    age: profile.age,
    gender: profile.gender,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    bodyFatPercentage: profile.bodyFatPercentage,
    fitnessGoal: goal.fitnessGoal,
    experienceLevel: goal.experienceLevel,
    trainingDaysPerWeek: goal.trainingDaysPerWeek,
    workoutDurationMinutes: goal.workoutDurationMinutes,
    availableEquipment: goal.availableEquipment,
    focusMuscles: goal.focusMuscles ?? [],
    dietPreference: profile.dietPreference,
    mealsPerDay: profile.mealsPerDay,
    foodPreferences: profile.foodPreferences ?? "",
    allergies: profile.allergies ?? "",
    unitSystem: profile.unitSystem ?? "metric",
    theme: profile.theme ?? "dark",
    planMode: profile.planMode ?? "ai",
  };
}

export function assembleUserSettings(profile: LeanProfile): UserSettings {
  return {
    unitSystem: profile.unitSystem ?? "metric",
    theme: profile.theme ?? "dark",
    aiPersona: profile.aiPersona ?? "scientific",
    audioChimes: profile.audioChimes ?? true,
    planMode: profile.planMode ?? "ai",
  };
}

export function toPublicUser(user: LeanUser & { _id: { toString(): string }; onboardingComplete: boolean }) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    onboardingComplete: user.onboardingComplete,
    createdAt: user.createdAt ? user.createdAt.toISOString() : null,
  };
}
