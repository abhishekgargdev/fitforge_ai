export function todayDate(value?: string) {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function toLogDto(doc: {
  _id: { toString(): string };
  foodItemId?: { toString(): string } | null;
  name: string;
  serving?: string;
  mealCategory: "breakfast" | "lunch" | "dinner" | "snack";
  grams?: number;
  caloriesKcal: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number;
  loggedAt: Date;
}) {
  return {
    id: String(doc._id),
    foodId: doc.foodItemId ? String(doc.foodItemId) : undefined,
    name: doc.name,
    serving: doc.serving,
    mealCategory: doc.mealCategory,
    grams: doc.grams,
    caloriesKcal: doc.caloriesKcal,
    proteinGrams: doc.proteinGrams,
    carbsGrams: doc.carbsGrams,
    fatGrams: doc.fatGrams,
    fiberGrams: doc.fiberGrams ?? 0,
    timeLogged: doc.loggedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}
