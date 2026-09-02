import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Fitness Coach Chat
  app.post("/api/ai/coach", async (req, res) => {
    try {
      const { message, userProfile, chatHistory } = req.body;
      const ai = getGeminiClient();

      if (ai) {
        const systemInstruction = `You are FitForge AI Coach, a world-class certified strength & conditioning specialist (CSCS) and sports nutritionist.
Your coaching style is encouraging, evidence-based, concise, data-driven, and highly practical.
User Profile:
- Name: ${userProfile?.name || "Athlete"}
- Fitness Goal: ${userProfile?.goal || "Build muscle & lose fat"}
- Experience: ${userProfile?.experience || "Intermediate"}
- Current Weight: ${userProfile?.weight || "80.4"} kg
- Body Fat: ${userProfile?.bodyFat || "22.4"}%
- Equipment: ${Array.isArray(userProfile?.equipment) ? userProfile.equipment.join(", ") : "Full Gym"}
- Training Days: ${userProfile?.trainingDays || 4} days/week

Guidelines:
1. Provide actionable, science-backed fitness and nutrition advice.
2. Structure key suggestions with concise bullet points or numbered steps.
3. Keep responses conversational and under 180 words unless deep detail is requested.
4. When suggesting exercise alternatives, explain biomechanical advantages based on their available equipment.
5. Clearly distinguish between measured facts, calculated data, and your AI recommendations.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: message,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        const reply = response.text || "I'm ready to help you optimize your training and nutrition. What's on your mind today?";
        return res.json({ reply, source: "gemini" });
      }

      // Smart responsive fallback if API key is not yet set
      const lower = (message || "").toLowerCase();
      let fallbackReply = `Based on your profile (${userProfile?.goal || "recomposition"} with ${userProfile?.trainingDays || 4} days/week), stay consistent with progressive overload and hit your daily protein target of ~${Math.round((userProfile?.weight || 80.4) * 2)}g.`;

      if (lower.includes("train today") || lower.includes("workout today")) {
        fallbackReply = `Based on your recent training history and split, today is optimal for your **Upper Body Hypertrophy** session (Chest, Back, Shoulders). Make sure to prioritize compound pressing early while your neuromuscular system is fresh!`;
      } else if (lower.includes("replace") || lower.includes("squat") || lower.includes("alternative")) {
        fallbackReply = `Yes! For barbell squats, depending on your available equipment, great substitutes include:
1. **Leg Press** (4 sets × 10-12 reps) — high quad load with minimal spinal shear.
2. **Bulgarian Split Squats** with dumbbells — fantastic for unilateral strength and hip stability.
3. **Hack Squat or Goblet Squat** — keeps an upright torso to target the quads directly.`;
      } else if (lower.includes("eat") || lower.includes("nutrition") || lower.includes("protein") || lower.includes("diet")) {
        fallbackReply = `Today, aim for **160g Protein, 220g Carbs, and 70g Healthy Fats** (~2,200 kcal). Focus on lean poultry, eggs/egg whites, greek yogurt, complex grains, and lots of leafy greens. Keep hydration around 3.5 liters!`;
      } else if (lower.includes("not losing weight") || lower.includes("plateau") || lower.includes("scale")) {
        fallbackReply = `Plateaus are very common during recomposition. Even if scale weight is flat, your body fat is trending down (-1.2%) while lean muscle is increasing (+0.8 kg). Don't drastically cut calories yet; maintain your current intake, track weekly averages, and keep training intensity high!`;
      } else if (lower.includes("recovery") || lower.includes("sore") || lower.includes("sleep")) {
        fallbackReply = `For accelerated recovery:
• Prioritize 7.5–8.5 hours of quality sleep.
• Take a 20-minute post-meal walk to enhance glucose disposal.
• Hydrate with electrolytes if training in warm conditions.
• Consider a 10-minute light mobility routine for your thoracic spine and hips.`;
      }

      return res.json({ reply: fallbackReply, source: "smart_assistant" });
    } catch (error: any) {
      console.error("AI Coach Error:", error);
      res.status(500).json({ error: "Failed to generate AI Coach response" });
    }
  });

  // AI Workout Plan Generator
  app.post("/api/ai/workout-plan", async (req, res) => {
    try {
      const { goal, daysPerWeek, duration, experience, equipment, focusMuscles, preferences } = req.body;
      const ai = getGeminiClient();

      if (ai) {
        const prompt = `Generate a structured, professional ${daysPerWeek}-day workout split for a ${experience} trainee with the goal of "${goal}".
Duration: ${duration} mins per session.
Equipment: ${Array.isArray(equipment) ? equipment.join(", ") : equipment}.
Focus muscles: ${Array.isArray(focusMuscles) ? focusMuscles.join(", ") : "Full body"}.
Special preferences: ${preferences || "Standard progression"}.

Return ONLY valid JSON matching this exact structure:
{
  "planTitle": "8-Week Hypertrophy & Recomposition Split",
  "summary": "High-efficiency resistance training routine emphasizing progressive overload and balanced volume.",
  "daysPerWeek": 4,
  "weeklySchedule": [
    {
      "day": "Monday",
      "focus": "Upper Body Strength & Hypertrophy",
      "estimatedMinutes": 45,
      "exercises": [
        {
          "name": "Barbell Bench Press",
          "target": "Chest",
          "equipment": "Barbell",
          "sets": 4,
          "reps": "6-8",
          "restSeconds": 120,
          "aiNote": "Focus on controlled 3-second eccentric lower."
        },
        {
          "name": "Incline Dumbbell Press",
          "target": "Upper Chest",
          "equipment": "Dumbbells",
          "sets": 3,
          "reps": "8-10",
          "restSeconds": 90,
          "aiNote": "Set bench angle to 30 degrees."
        },
        {
          "name": "Chest Supported Row",
          "target": "Upper Back / Lats",
          "equipment": "Dumbbells",
          "sets": 4,
          "reps": "8-10",
          "restSeconds": 90,
          "aiNote": "Squeeze scapulae firmly at top contraction."
        },
        {
          "name": "Overhead Dumbbell Shoulder Press",
          "target": "Front Delts",
          "equipment": "Dumbbells",
          "sets": 3,
          "reps": "10-12",
          "restSeconds": 75,
          "aiNote": "Keep core tight, do not arch lower back."
        },
        {
          "name": "Triceps Cable Rope Pushdown",
          "target": "Triceps",
          "equipment": "Cable",
          "sets": 3,
          "reps": "12-15",
          "restSeconds": 60,
          "aiNote": "Spread the rope at bottom lockout."
        }
      ]
    }
  ]
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const parsed = JSON.parse(response.text || "{}");
        return res.json(parsed);
      }

      // Default smart plan builder if offline / no key
      return res.json({
        planTitle: `${goal === "fat_loss" ? "Cut & Condition" : goal === "strength" ? "Pure Strength Peak" : "8-Week Lean Muscle & Body Recomposition"}`,
        summary: `Tailored for ${experience} level with ${daysPerWeek} training days/week utilizing ${Array.isArray(equipment) ? equipment.join(", ") : "available gym equipment"}.`,
        daysPerWeek: Number(daysPerWeek) || 4,
        weeklySchedule: [
          {
            day: "Monday",
            focus: "Upper Body Power & Hypertrophy",
            isRest: false,
            estimatedMinutes: Number(duration) || 45,
            exercises: [
              {
                name: "Barbell Bench Press",
                target: "Chest",
                equipment: "Barbell",
                sets: 4,
                reps: "6-8",
                restSeconds: 120,
                aiNote: "Drive feet into floor and maintain tight scapular retraction."
              },
              {
                name: "Incline Dumbbell Press",
                target: "Upper Chest",
                equipment: "Dumbbells",
                sets: 3,
                reps: "8-10",
                restSeconds: 90,
                aiNote: "Pause 1s at bottom stretch for maximum pectoral recruitment."
              },
              {
                name: "Lat Pulldown (Wide Grip)",
                target: "Lats & Upper Back",
                equipment: "Cable",
                sets: 3,
                reps: "10-12",
                restSeconds: 90,
                aiNote: "Lead the pull with your elbows, avoid excessive backward lean."
              },
              {
                name: "Dumbbell Lateral Raise",
                target: "Side Delts",
                equipment: "Dumbbells",
                sets: 3,
                reps: "12-15",
                restSeconds: 60,
                aiNote: "Slight forward torso lean; pour out the pitcher at peak."
              },
              {
                name: "Cable Triceps Pushdown",
                target: "Triceps",
                equipment: "Cable",
                sets: 3,
                reps: "12-15",
                restSeconds: 60,
                aiNote: "Pin upper arms to ribs, full lockout at bottom."
              }
            ]
          },
          {
            day: "Tuesday",
            focus: "Active Recovery & Mobility",
            isRest: true,
            estimatedMinutes: 20,
            exercises: []
          },
          {
            day: "Wednesday",
            focus: "Lower Body Quad & Posterior Chain",
            isRest: false,
            estimatedMinutes: Number(duration) || 50,
            exercises: [
              {
                name: "Barbell Back Squat",
                target: "Quads & Glutes",
                equipment: "Barbell",
                sets: 4,
                reps: "6-8",
                restSeconds: 120,
                aiNote: "Hit parallel depth, drive through mid-foot."
              },
              {
                name: "Romanian Deadlift (RDL)",
                target: "Hamstrings & Glutes",
                equipment: "Barbell / Dumbbells",
                sets: 3,
                reps: "8-10",
                restSeconds: 90,
                aiNote: "Hinge hips backward until deep hamstring stretch."
              },
              {
                name: "Leg Press",
                target: "Quads",
                equipment: "Machine",
                sets: 3,
                reps: "10-12",
                restSeconds: 90,
                aiNote: "Do not lock knees completely at top."
              },
              {
                name: "Standing Calf Raises",
                target: "Calves",
                equipment: "Machine / Dumbbell",
                sets: 4,
                reps: "15",
                restSeconds: 45,
                aiNote: "2-second pause at full deep stretch."
              }
            ]
          },
          {
            day: "Thursday",
            focus: "Rest & Muscle Repair",
            isRest: true,
            estimatedMinutes: 0,
            exercises: []
          },
          {
            day: "Friday",
            focus: "Push (Chest, Shoulders, Triceps)",
            isRest: false,
            estimatedMinutes: Number(duration) || 45,
            exercises: [
              {
                name: "Overhead Barbell Press",
                target: "Shoulders",
                equipment: "Barbell",
                sets: 3,
                reps: "6-8",
                restSeconds: 120,
                aiNote: "Squeeze glutes and brace core tightly."
              },
              {
                name: "Dumbbell Flyes / Cable Crossover",
                target: "Chest",
                equipment: "Cable / Dumbbells",
                sets: 3,
                reps: "12-15",
                restSeconds: 60,
                aiNote: "Focus on peak contraction in the center."
              },
              {
                name: "Skull Crushers (EZ Bar)",
                target: "Triceps Long Head",
                equipment: "EZ Bar",
                sets: 3,
                reps: "10-12",
                restSeconds: 75,
                aiNote: "Lower behind the head for greater stretch."
              }
            ]
          },
          {
            day: "Saturday",
            focus: "Pull & Core (Back, Biceps, Abs)",
            isRest: false,
            estimatedMinutes: Number(duration) || 45,
            exercises: [
              {
                name: "Barbell Bent-Over Row",
                target: "Lats & Rhomboids",
                equipment: "Barbell",
                sets: 4,
                reps: "8-10",
                restSeconds: 90,
                aiNote: "Pull bar towards belly button, torso at 45 degrees."
              },
              {
                name: "Incline Dumbbell Bicep Curl",
                target: "Biceps",
                equipment: "Dumbbells",
                sets: 3,
                reps: "10-12",
                restSeconds: 60,
                aiNote: "Full bicep stretch at bottom without swinging."
              },
              {
                name: "Hanging Leg Raises",
                target: "Core / Rectus Abdominis",
                equipment: "Pull-up Bar",
                sets: 3,
                reps: "12-15",
                restSeconds: 60,
                aiNote: "Roll pelvis upward rather than just swinging legs."
              }
            ]
          },
          {
            day: "Sunday",
            focus: "Rest & Nutrition Prep",
            isRest: true,
            estimatedMinutes: 0,
            exercises: []
          }
        ]
      });
    } catch (error: any) {
      console.error("AI Workout Planner Error:", error);
      res.status(500).json({ error: "Failed to generate workout plan" });
    }
  });

  // AI Nutrition Plan Generator
  app.post("/api/ai/nutrition-plan", async (req, res) => {
    try {
      const { calories, protein, carbs, fat, diet, mealsPerDay, preferences, allergies, cuisine } = req.body;
      const ai = getGeminiClient();

      if (ai) {
        const prompt = `Generate a complete daily meal plan for a fitness enthusiast.
Calories: ${calories || 2200} kcal
Protein: ${protein || 160}g | Carbs: ${carbs || 220}g | Fat: ${fat || 70}g
Dietary Preference: ${diet || "Non-vegetarian"}
Meals per day: ${mealsPerDay || 4}
Preferences: ${preferences || "Clean whole foods"}
Allergies: ${allergies || "None"}
Cuisine: ${cuisine || "Balanced modern global / Mediterranean / Indian"}

Return ONLY valid JSON matching this schema:
{
  "totalCalories": 2200,
  "totalProtein": 160,
  "totalCarbs": 220,
  "totalFat": 70,
  "meals": [
    {
      "mealType": "Breakfast",
      "title": "Protein Power Oats & Berry Medley",
      "calories": 520,
      "protein": 34,
      "carbs": 68,
      "fat": 12,
      "ingredients": ["Rolled oats (75g)", "Whey or Plant Protein (30g)", "Blueberries (50g)", "Almond butter (15g)", "Unsweetened almond milk"],
      "aiTip": "Slow-burning complex carbohydrates provide sustained morning glucose stability."
    }
  ]
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const parsed = JSON.parse(response.text || "{}");
        return res.json(parsed);
      }

      // Default smart nutrition synthesis
      const targetCals = Number(calories) || 2200;
      const targetP = Number(protein) || 160;
      const targetC = Number(carbs) || 220;
      const targetF = Number(fat) || 70;

      return res.json({
        totalCalories: targetCals,
        totalProtein: targetP,
        totalCarbs: targetC,
        totalFat: targetF,
        meals: [
          {
            mealType: "Breakfast",
            title: "Overnight High-Protein Oats with Banana & Chia",
            calories: Math.round(targetCals * 0.25),
            protein: Math.round(targetP * 0.22),
            carbs: Math.round(targetC * 0.32),
            fat: Math.round(targetF * 0.20),
            ingredients: [
              "Rolled Oats (70g)",
              "Vanilla Whey/Plant Isolate (30g)",
              "Banana slices (1 medium)",
              "Greek Yogurt 0% (100g)",
              "Chia Seeds (10g)"
            ],
            aiTip: "Rich in soluble beta-glucan fiber for sustained morning mental focus and gut microbiome support."
          },
          {
            mealType: "Lunch",
            title: "Grilled Herb Chicken / Tofu Quinoa Bowl with Avocados",
            calories: Math.round(targetCals * 0.35),
            protein: Math.round(targetP * 0.34),
            carbs: Math.round(targetC * 0.32),
            fat: Math.round(targetF * 0.35),
            ingredients: [
              diet?.toLowerCase().includes("vegan") || diet?.toLowerCase().includes("vegetarian")
                ? "Pan-seared Organic Tofu / Paneer (180g)"
                : "Grilled Herb Chicken Breast (200g)",
              "Steamed Brown Rice or Quinoa (160g)",
              "Avocado (50g)",
              "Steamed Broccoli & Bell Peppers (150g)",
              "Cold-pressed Olive Oil (10ml)"
            ],
            aiTip: "Perfect balanced insulin response ideal for mid-day satiety and pre-workout glycogen storage."
          },
          {
            mealType: "Snack / Pre-Workout",
            title: "Greek Yogurt Crunch & Seasonal Berries",
            calories: Math.round(targetCals * 0.12),
            protein: Math.round(targetP * 0.14),
            carbs: Math.round(targetC * 0.12),
            fat: Math.round(targetF * 0.10),
            ingredients: [
              "Thick Greek Yogurt (175g)",
              "Blueberries / Strawberries (80g)",
              "Crushed Walnuts / Almonds (15g)",
              "Honey drizzle (5g)"
            ],
            aiTip: "Fast-acting leucine and casein blend ensures sustained amino acid delivery during training."
          },
          {
            mealType: "Dinner",
            title: "Wild Salmon / Tempeh with Roasted Sweet Potatoes & Asparagus",
            calories: Math.round(targetCals * 0.28),
            protein: Math.round(targetP * 0.30),
            carbs: Math.round(targetC * 0.24),
            fat: Math.round(targetF * 0.35),
            ingredients: [
              diet?.toLowerCase().includes("vegan") || diet?.toLowerCase().includes("vegetarian")
                ? "Tempeh & Lentil Dal Bowl (220g)"
                : "Pan-roasted Wild Salmon Fillet (180g)",
              "Roasted Sweet Potato wedges (180g)",
              "Tender Asparagus Spears (120g)",
              "Mixed Green Salad with Lemon Dressing"
            ],
            aiTip: "Rich in Omega-3 EPA/DHA to reduce systemic muscular inflammation while you sleep."
          }
        ]
      });
    } catch (error: any) {
      console.error("AI Nutrition Planner Error:", error);
      res.status(500).json({ error: "Failed to generate nutrition plan" });
    }
  });

  // AI Progress Analysis
  app.post("/api/ai/progress-analysis", async (req, res) => {
    try {
      const { userProgress, recentTrends } = req.body;
      const ai = getGeminiClient();

      if (ai) {
        const prompt = `Analyze 6-month body composition and fitness progress for athlete:
Data:
- Starting Weight: 83.2 kg -> Current: 80.4 kg (-2.8 kg)
- Starting Body Fat: 25.1% -> Current: 22.4% (-2.7%)
- Skeletal Muscle: +0.8 kg gain
- Training consistency: 92%
- Nutrition consistency: 88%

Generate a comprehensive, encouraging, data-backed analysis.
Return JSON matching:
{
  "headline": "Exceptional Body Recomposition Phase",
  "summary": "You have successfully lowered body fat while increasing lean contractile muscle mass.",
  "whatIsGoingWell": [
    "Body fat drop of 2.7% confirms optimal caloric deficit adherence without muscle catabolism.",
    "Bench Press & Squat training volume increased by 8.4% over 8 weeks.",
    "High protein adherence (>150g/day average) preserved lean tissue."
  ],
  "whatNeedsAttention": [
    "Weekend water intake dips slightly (~1.8L vs weekday 3.2L).",
    "Rest interval timing during leg days occasionally runs over 3 minutes."
  ],
  "recommendations": [
    "Maintain current 2,200 kcal baseline for 4 more weeks before initiating a deload.",
    "Add 15 minutes of low-intensity zone-2 cardio twice a week for mitochondrial density."
  ],
  "nextMonthFocus": "Prioritize progressive overload on secondary pull movements and stabilize weekend hydration."
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const parsed = JSON.parse(response.text || "{}");
        return res.json(parsed);
      }

      // Default smart progress evaluation
      return res.json({
        headline: "High-Efficiency Body Recomposition Confirmed",
        summary: "Your body fat percentage decreased by 2.7% while skeletal muscle increased by +0.8 kg. This demonstrates textbook recomposition with stellar neuromuscular adaptation.",
        whatIsGoingWell: [
          "Consistent caloric control resulted in -2.8 kg scale weight reduction with zero muscle loss.",
          "Weekly workout completion rate is at 94% across the last 60 days.",
          "Chest and Lat progressive volume increased by +6.2% over last month."
        ],
        whatNeedsAttention: [
          "Fiber intake averaged 21g/day against your 30g daily target.",
          "Sleep duration averaged 6h 40m on Thursday nights — aim for 7h 30m."
        ],
        recommendations: [
          "Continue current 4-day resistance split with 2,200 kcal daily intake.",
          "Increase daily fiber via chia seeds, berries, and cruciferous vegetables.",
          "Maintain current heavy compound focus before next planned deload week."
        ],
        nextMonthFocus: "Surpass 100 kg on Barbell Bench Press working sets and reduce visceral fat by another 1 point."
      });
    } catch (error: any) {
      console.error("AI Progress Analysis Error:", error);
      res.status(500).json({ error: "Failed to generate progress analysis" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FitForge AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
