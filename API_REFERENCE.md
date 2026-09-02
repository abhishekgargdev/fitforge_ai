# FitForge AI — Centralized API Reference

This document serves as the single source of truth for all API routes built across FitForge AI.

---

## Response Envelope Specifications

All API routes follow a standard response structure:

### Success Envelope
```json
{
  "data": { ... }
}
```

### Error Envelope
```json
{
  "error": {
    "message": "Human readable error description",
    "code": "ERROR_CODE_STRING"
  }
}
```

---

## Route Access Tiers
- **Public**: No authentication session required.
- **Semi-Protected**: Authentication session required; onboarding profile may be incomplete.
- **Private**: Authentication session AND completed onboarding required.

---

## 1. Authentication (`/api/auth/*`)

### `POST /api/auth/register`
- **Auth Tier**: Public
- **Request Body**: `{ "name": "...", "email": "...", "password": "..." }`
- **Response**: `{ "data": { "user": { "id": "...", "email": "...", "name": "..." } } }`

### `POST /api/auth/login`
- **Auth Tier**: Public
- **Request Body**: `{ "email": "...", "password": "..." }`
- **Response**: `{ "data": { "user": { "id": "...", "email": "...", "name": "...", "onboardingComplete": true } } }`

### `POST /api/auth/logout`
- **Auth Tier**: Public
- **Request Body**: None
- **Response**: `{ "data": { "success": true } }`

### `POST /api/auth/forgot-password`
- **Auth Tier**: Public
- **Request Body**: `{ "email": "..." }`
- **Response**: `{ "data": { "message": "If that email exists, password reset instructions have been sent." } }`

### `POST /api/auth/reset-password`
- **Auth Tier**: Public
- **Request Body**: `{ "token": "...", "password": "..." }`
- **Response**: `{ "data": { "success": true } }`

### `GET /api/auth/session`
- **Auth Tier**: Public
- **Response**: `{ "data": { "user": { "id": "...", "email": "...", "name": "...", "onboardingComplete": true } } }`

---

## 2. Onboarding (`/api/onboarding`)

### `POST /api/onboarding`
- **Auth Tier**: Semi-Protected
- **Request Body**: Full onboarding payload (`name`, `age`, `gender`, `heightCm`, `weightKg`, `bodyFatPercentage`, `fitnessGoal`, `experienceLevel`, `trainingDaysPerWeek`, `workoutDurationMinutes`, `availableEquipment`, `focusMuscles`, `dietPreference`, `mealsPerDay`, `foodPreferences`, `allergies`, `unitSystem`, `theme`).
- **Response**: `{ "data": { "user": { ... }, "profile": { ... }, "goal": { ... } } }`

---

## 3. Profile & User Settings (`/api/profile`, `/api/settings`, `/api/account`)

### `GET /api/profile`
- **Auth Tier**: Private
- **Response**: `{ "data": { "profile": UserProfile, "memberSince": "ISO_DATE" } }`

### `PUT /api/profile`
- **Auth Tier**: Private
- **Request Body**: Partial or complete profile update (`name`, `age`, `gender`, `heightCm`, `weightKg`, `bodyFatPercentage`, etc.).
- **Response**: `{ "data": { "profile": UserProfile, "memberSince": "ISO_DATE" } }`

### `GET /api/settings`
- **Auth Tier**: Private
- **Response**: `{ "data": { "settings": { "unitSystem": "...", "theme": "...", "aiPersona": "...", "audioChimes": true } } }`

### `PUT /api/settings`
- **Auth Tier**: Private
- **Request Body**: Partial settings object (`unitSystem`, `theme`, `aiPersona`, `audioChimes`).
- **Response**: `{ "data": { "settings": UserSettings } }`

### `DELETE /api/account`
- **Auth Tier**: Private
- **Request Body**: None
- **Response**: `{ "data": { "success": true } }`

---

## 4. Exercise Catalog (`/api/exercises/*`)

### `GET /api/exercises`
- **Auth Tier**: Private
- **Query Params**: `q` (search string), `bodyPart`, `equipment`, `target`, `difficulty`, `page` (default: 1), `limit` (default: 24).
- **Response**: `{ "data": { "items": Exercise[], "page": 1, "limit": 24, "total": 1300, "totalPages": 55 } }`

### `GET /api/exercises/:id`
- **Auth Tier**: Private
- **Response**: `{ "data": { "exercise": Exercise } }`

### `GET /api/exercises/:id/related`
- **Auth Tier**: Private
- **Query Params**: `limit` (default: 6)
- **Response**: `{ "data": { "items": Exercise[] } }`

---

## 5. Workouts & Workout Plans (`/api/workouts/*`, `/api/workout-plans/*`)

### `GET /api/workouts`
- **Auth Tier**: Private
- **Query Params**: `page` (default: 1), `limit` (default: 20), `from`, `to`
- **Response**: `{ "data": { "items": CompletedWorkoutSummary[], "page": 1, "limit": 20, "total": 42 } }`

### `POST /api/workouts`
- **Auth Tier**: Private
- **Request Body**: `{ "workoutPlanId": "...", "dayIndex": 0 }`
- **Response**: `{ "data": { "session": ActiveWorkoutSession } }`

### `GET /api/workouts/:id`
- **Auth Tier**: Private
- **Response**: `{ "data": { "session": ActiveWorkoutSession } }`

### `PUT /api/workouts/:id`
- **Auth Tier**: Private
- **Request Body**: `{ "exercises": [ ... ], "status": "in_progress" | "completed" | "cancelled" }`
- **Response**: `{ "data": { "session": ActiveWorkoutSession } }`

### `DELETE /api/workouts/:id`
- **Auth Tier**: Private
- **Response**: `{ "data": { "success": true } }`

### `POST /api/workouts/:id/complete`
- **Auth Tier**: Private
- **Request Body**: `{ "durationMinutes": 45, "exercises": [ ... ] }`
- **Response**: `{ "data": { "summary": CompletedWorkoutSummary } }`

### `GET /api/workouts/records`
- **Auth Tier**: Private
- **Response**: `{ "data": { "records": [ { "exerciseId": "...", "exerciseName": "...", "maxWeightKg": 100, "maxVolumeKg": 1200, "date": "ISO_DATE" } ] } }`

### `GET /api/workout-plans`
- **Auth Tier**: Private
- **Query Params**: `page` (optional), `limit` (optional)
- **Response**: `{ "data": { "items": WorkoutSplitSchedule[], "active": WorkoutSplitSchedule | null, "pagination": { ... } } }`

### `POST /api/workout-plans`
- **Auth Tier**: Private
- **Request Body**: `{ "daysPerWeek": 4, "focus": "Hypertrophy", "equipment": ["full_gym"] }`
- **Response**: `{ "data": { "plan": WorkoutSplitSchedule } }`

### `GET /api/workout-plans/:id`
- **Auth Tier**: Private
- **Response**: `{ "data": { "plan": WorkoutSplitSchedule } }`

### `PUT /api/workout-plans/:id`
- **Auth Tier**: Private
- **Request Body**: `{ "title": "...", "days": [ ... ] }`
- **Response**: `{ "data": { "plan": WorkoutSplitSchedule } }`

### `DELETE /api/workout-plans/:id`
- **Auth Tier**: Private
- **Response**: `{ "data": { "success": true } }`

### `POST /api/workout-plans/:id/activate`
- **Auth Tier**: Private
- **Response**: `{ "data": { "active": WorkoutSplitSchedule } }`

### `POST /api/workout-plans/:id/regenerate`
- **Auth Tier**: Private
- **Response**: `{ "data": { "plan": WorkoutSplitSchedule } }`

---

## 6. Nutrition & Food Logs (`/api/foods/*`, `/api/food-logs/*`, `/api/nutrition-goals`)

### `GET /api/foods/search`
- **Auth Tier**: Private
- **Query Params**: `q` (query term)
- **Response**: `{ "data": { "items": FoodItem[] } }`

### `GET /api/foods/:id`
- **Auth Tier**: Private
- **Response**: `{ "data": { "food": FoodItem } }`

### `GET /api/foods/barcode/:code`
- **Auth Tier**: Private
- **Response**: `{ "data": { "food": FoodItem } }`

### `GET /api/food-logs`
- **Auth Tier**: Private
- **Query Params**: `date` (YYYY-MM-DD), `from`, `to`, `page` (optional), `limit` (optional)
- **Response**: `{ "data": { "items": LoggedMealEntry[], "pagination": { ... } } }`

### `POST /api/food-logs`
- **Auth Tier**: Private
- **Request Body**: `{ "mealCategory": "breakfast", "foodId": "...", "servings": 1 }` OR custom item specs (`name`, `caloriesKcal`, `proteinGrams`, `carbsGrams`, `fatGrams`).
- **Response**: `{ "data": { "log": LoggedMealEntry } }`

### `PUT /api/food-logs/:id`
- **Auth Tier**: Private
- **Request Body**: Partial log fields (`grams`, `caloriesKcal`, `proteinGrams`, `carbsGrams`, `fatGrams`, `serving`).
- **Response**: `{ "data": { "log": LoggedMealEntry } }`

### `DELETE /api/food-logs/:id`
- **Auth Tier**: Private
- **Response**: `{ "data": { "success": true } }`

### `GET /api/food-logs/summary`
- **Auth Tier**: Private
- **Query Params**: `date` (YYYY-MM-DD)
- **Response**: `{ "data": { "date": "...", "consumed": { "calories": 2100, "protein": 160, "carbs": 210, "fat": 65, "fiber": 30 }, "targets": { ... } } }`

### `GET /api/nutrition-goals`
- **Auth Tier**: Private
- **Response**: `{ "data": { "targets": DailyNutritionTarget } }`

### `PUT /api/nutrition-goals`
- **Auth Tier**: Private
- **Request Body**: Partial or complete targets (`targetCaloriesKcal`, `targetProteinGrams`, `targetCarbsGrams`, `targetFatGrams`, `targetFiberGrams`).
- **Response**: `{ "data": { "targets": DailyNutritionTarget } }`

---

## 7. Measurements & Progress (`/api/measurements/*`, `/api/progress/*`)

### `GET /api/measurements`
- **Auth Tier**: Private
- **Query Params**: `page` (default: 1), `limit` (default: 20), `from`, `to`
- **Response**: `{ "data": { "items": BodyMeasurementRecord[], "monthly": MonthlyMeasurement[], "page": 1, "limit": 20, "total": 12 } }`

### `POST /api/measurements`
- **Auth Tier**: Private
- **Request Body**: `{ "weightKg": 75.5, "bodyFatPercentage": 16.2, "chestCm": 102, ... }`
- **Response**: `{ "data": { "measurement": BodyMeasurementRecord, "monthly": MonthlyMeasurement } }`

### `GET /api/measurements/latest`
- **Auth Tier**: Private
- **Response**: `{ "data": { "measurement": BodyMeasurementRecord | null } }`

### `GET /api/measurements/compare`
- **Auth Tier**: Private
- **Query Params**: `dateA` (YYYY-MM-DD), `dateB` (YYYY-MM-DD)
- **Response**: `{ "data": { "entryA": BodyMeasurementRecord, "entryB": BodyMeasurementRecord, "deltas": { ... } } }`

### `GET /api/measurements/:id`
- **Auth Tier**: Private
- **Response**: `{ "data": { "measurement": BodyMeasurementRecord } }`

### `PUT /api/measurements/:id`
- **Auth Tier**: Private
- **Request Body**: Partial measurement fields.
- **Response**: `{ "data": { "measurement": BodyMeasurementRecord } }`

### `DELETE /api/measurements/:id`
- **Auth Tier**: Private
- **Response**: `{ "data": { "success": true } }`

### `GET /api/progress`
- **Auth Tier**: Private
- **Query Params**: `metric` (`weight` | `body_fat` | `muscle_mass` | `chest` | `waist` | `biceps`), `range` (`1M` | `3M` | `6M` | `1Y` | `ALL`)
- **Response**: `{ "data": { "metric": "weight", "range": "3M", "series": [ { "date": "...", "value": 75.5 } ], "changeDelta": -2.1 } }`

### `GET /api/progress/summary`
- **Auth Tier**: Private
- **Query Params**: `range` (`1M` | `3M` | `6M` | `1Y`)
- **Response**: `{ "data": { "range": "3M", "weightChangeKg": -2.5, "bodyFatChangePct": -1.2, "muscleGainKg": 1.1, "insights": [ ... ] } }`

---

## 8. Dashboard (`/api/dashboard`)

### `GET /api/dashboard`
- **Auth Tier**: Private
- **Response**: `{ "data": { "userProfile": UserProfile, "activePlan": WorkoutSplitSchedule, "todayNutrition": { ... }, "latestMeasurement": BodyMeasurementRecord, "recentWorkouts": CompletedWorkoutSummary[] } }`

---

## 9. AI Services (`/api/ai/*`)

### `POST /api/ai/chat`
- **Auth Tier**: Private
- **Request Body**: `{ "message": "How do I optimize leg hypertrophy?", "conversationId": "..." }`
- **Response**: `{ "data": { "reply": AIChatMessage, "conversationId": "..." } }`

### `GET /api/ai/conversations`
- **Auth Tier**: Private
- **Response**: `{ "data": { "conversations": [ { "id": "...", "title": "...", "updatedAt": "..." } ] } }`

### `DELETE /api/ai/conversations`
- **Auth Tier**: Private
- **Response**: `{ "data": { "success": true } }`

### `POST /api/ai/workout-plan`
- **Auth Tier**: Private
- **Request Body**: `{ "daysPerWeek": 4, "fitnessGoal": "build_muscle", "experienceLevel": "intermediate", "equipment": ["full_gym"] }`
- **Response**: `{ "data": { "workoutPlan": WorkoutSplitSchedule } }`

### `POST /api/ai/nutrition-plan`
- **Auth Tier**: Private
- **Request Body**: `{ "targetCalories": 2400, "dietPreference": "high_protein", "mealsPerDay": 4 }`
- **Response**: `{ "data": { "mealPlan": AIMealPlan } }`

### `POST /api/ai/progress-analysis`
- **Auth Tier**: Private
- **Request Body**: `{ "range": "3M" }`
- **Response**: `{ "data": { "analysis": { "summary": "...", "highlights": [ ... ], "recommendations": [ ... ] } } }`

### `GET /api/ai/usage`
- **Auth Tier**: Private
- **Response**: `{ "data": { "totalRequestsToday": 14, "limit": 100, "remaining": 86 } }`

---

## 10. Notifications (`/api/notifications/*`)

### `GET /api/notifications`
- **Auth Tier**: Private
- **Query Params**: `page` (default: 1), `limit` (default: 20), `unreadOnly` (boolean string)
- **Response**: `{ "data": { "notifications": NotificationItem[], "pagination": { "page": 1, "limit": 20, "total": 4, "totalPages": 1 } } }`

### `PUT /api/notifications/:id/read`
- **Auth Tier**: Private
- **Response**: `{ "data": { "notification": NotificationItem } }`

### `PUT /api/notifications/read-all`
- **Auth Tier**: Private
- **Response**: `{ "data": { "success": true, "modifiedCount": 3 } }`

### `DELETE /api/notifications/:id`
- **Auth Tier**: Private
- **Response**: `{ "data": { "success": true, "id": "..." } }`
