# FitForge AI 🏋️‍♂️🤖

> **FitForge AI** is a state-of-the-art, AI-powered fitness, workout planning, nutrition tracking, and body composition analytics platform. Built with Next.js 16, TypeScript, MongoDB, TailwindCSS, and multi-provider AI orchestrators (Google Gemini & NVIDIA NIM).

---

## 🌟 Key Features

### 🏋️ Workouts & AI Plan Generator
- **AI Workout Split Planner**: Generates personalized weekly workout splits (Push/Pull/Legs, Upper/Lower, Full Body) matching user goals, equipment, duration, and target muscles.
- **Smart Pacing & Relative Intensity (`intensityLevel`)**:
  - Automatically assesses user training history. For first-ever plans (0 completed sessions logged), the AI schedules moderate/light ramp-up assessment sessions for the first 1–2 days.
  - Assigns `light`, `moderate`, or `hard` intensity badges to every training day card.
  - Spares users from back-to-back heavy sessions.
- **Locking & Manual Mode (Phase 18)**: Lock specific days or individual exercises to preserve them against AI changes or cron regenerations.
- **Exercise Swapping**: Swap any exercise on your plan or during an active session with AI-proposing biomechanically equivalent alternatives filtered by user-selected equipment exclusions and reasons.
- **Interactive Workout Tracker**: Real-time live set tracking with weight/rep logging, Rest Interval Timer, AI coaching cues, and start/end weight check-in modals.

### 📚 Exercise Catalog & Community Movements
- **Synced ExerciseDB V1 Catalog**: ~1500 exercises synced with animated GIFs, instructions, equipment, target muscles, and secondary muscles.
- **Abs / Core Category**: Full integration of abdominal and core movements across library filters, focus muscle multi-selects, and AI planner prompts.
- **GIF Lightbox & Video Previews**: Modal previews with step-by-step instructions, equipment tags, and muscle visualizers.
- **Community Exercise Uploads**: Upload custom exercise movements with Cloudinary image hosting.

### 🥗 Nutrition & AI Food Logging
- **USDA FoodData Central & Open Food Facts**: Search standard food items and scan packaged goods via barcode lookup.
- **Conversational AI Chat Food Logging**: Log meals naturally by chatting with FitForge AI Coach (e.g. *"I ate 2 chapatis and dal for lunch"*).
- **AI Vision Food Photo Logging**: Upload meal photos to automatically estimate ingredients, portion sizes, calories, and macronutrients.
- **Calorie & Macro Targets**: Pure TypeScript deterministic functions (`src/lib/calculations`) compute BMR, TDEE, and macro split targets based on user goals.

### 📈 Progress Analytics & Body Composition
- **Ad-Hoc & Monthly Body Assessments**: Track weight, body fat %, visceral fat, muscle mass, chest, waist, hips, biceps, thighs, and calves.
- **Interactive Recharts Visualizer**: Track weight trends vs. goal target lines and body measurement deltas over 30/60/90 days.
- **AI Progress Analysis Report**: Generates personalized progress summaries and actionable adjustments based on logged sessions and measurements.

### 🧠 FitForge AI Coach & Daily Recovery
- **24/7 Fitness & Nutrition Chatbot**: Context-aware assistant backed by Gemini and NVIDIA NIM orchestrators with safety guardrails.
- **Daily Recovery Score**: Computes daily muscle readiness, sleep quality, and strain scores with AI-suggested active recovery protocols.
- **Rest-Day Activity Logging**: Log light cardio, walking, stretching, or mobility work on rest days.
- **Automated Weekly Plan Cron**: Vercel daily cron trigger (`/api/cron/generate-weekly-plans`) auto-renews plans for active AI-mode users 7 days after generation.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: TypeScript (Strict Mode)
- **Styling**: TailwindCSS v4 + Dark Mode Glassmorphism UI
- **Database & ODM**: [MongoDB Atlas](https://www.mongodb.com/) + [Mongoose 9](https://mongoosejs.com/)
- **Authentication**: NextAuth.js (Credentials + OAuth) & bcryptjs password hashing
- **AI Orchestrator**: Internal multi-provider fallback engine (`src/lib/ai/orchestrator.ts`)
  - **Text & Reasoning**: NVIDIA NIM (`nvidia/nemotron-3-ultra-550b`) & Rotating Google Gemini Key Pool (`gemini-3.6-flash`)
  - **Vision & Image Analysis**: NVIDIA NIM (`meta/llama-3.2-11b-vision-instruct`) & Google Gemini Key Pool (`gemini-3.6-flash`)
- **External Data Providers**:
  - ExerciseDB V1 (Exercise catalog & animated GIFs)
  - USDA FoodData Central & Open Food Facts (Nutrition database & Barcodes)
  - Cloudinary (Custom exercise & food photo uploads)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or higher
- MongoDB Atlas connection string
- Google Gemini API key(s) or NVIDIA NIM API key

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/abhishekgargdev/fitforge_ai.git
   cd fitforge-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory (copy from `.env.example` if available):
   ```env
   # Core & Database
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_key_here
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/fitforge_ai

   # AI Providers
   GEMINI_API_KEYS=key1,key2,key3
   NVIDIA_NIM_API_KEY=nvapi-your_nvidia_key

   # Cloudinary Media Storage
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # External Data APIs
   EXERCISEDB_API_KEY=your_exercisedb_key
   USDA_API_KEY=your_usda_api_key

   # Cron Protection
   CRON_SECRET=your_cron_secret_header
   ```

4. **Sync Exercise Catalog**:
   ```bash
   npm run sync:exercises
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

6. **Production Build & Verification**:
   ```bash
   npm run build
   npm run start
   ```

---

## 📡 API Reference & Architecture Map

### 🔓 Authentication & Onboarding
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/login` | Credentials authentication login |
| `POST` | `/api/auth/forgot-password` | Send password reset token email |
| `POST` | `/api/auth/reset-password` | Reset password using valid token |
| `GET` | `/api/auth/session` | Get active session session details |
| `POST` | `/api/onboarding` | Submit onboarding profile, goals, equipment & training days |

### 🏋️ Workouts & Workout Plans
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/workout-plans` | Fetch user's workout plans (active & archived) |
| `POST` | `/api/workout-plans` | Generate & activate new AI workout plan |
| `GET` | `/api/workout-plans/[id]` | Get detailed split schedule for plan ID |
| `POST` | `/api/workout-plans/[id]/activate` | Set specified plan as current active split |
| `POST` | `/api/workout-plans/[id]/regenerate` | Regenerate unlocked plan days with AI |
| `PUT` | `/api/workout-plans/[id]/lock` | Toggle lock state for day or exercise |
| `POST` | `/api/workout-plans/[id]/days/[dayId]/exercises` | Add custom exercise movement to plan day |
| `PUT` | `/api/workout-plans/[id]/days/[dayId]/exercises` | Update exercise order (`exerciseOrder: string[]`) |
| `POST` | `/api/workout-plans/[id]/days/[dayId]/exercises/[exerciseId]/swap` | Swap exercise with AI proposal or manual selection |
| `GET` | `/api/workouts` | Get workout session history |
| `POST` | `/api/workouts` | Start active workout session |
| `GET` | `/api/workouts/[id]` | Get active workout session details |
| `POST` | `/api/workouts/[id]/complete` | Complete active workout session & save logged sets |
| `POST` | `/api/workouts/[id]/exercises/[exerciseId]/swap` | Swap exercise during live active workout session |
| `GET` | `/api/workouts/records` | Fetch personal strength PRs across exercises |

### 📚 Exercises Catalog
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/exercises` | Search & filter exercise catalog (`?search=`, `?bodyPart=`, `?equipment=`, `?difficulty=`) |
| `POST` | `/api/exercises` | Create custom community exercise entry |
| `GET` | `/api/exercises/[id]` | Fetch exercise details by ID |
| `GET` | `/api/exercises/[id]/related` | Fetch alternative/related exercise suggestions |

### 🥗 Nutrition & Food Logging
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/food-logs` | Fetch food log entries (`?date=` or `?from=&to=`) |
| `POST` | `/api/food-logs` | Log food item entry |
| `DELETE` | `/api/food-logs/[id]` | Delete logged food entry |
| `GET` | `/api/food-logs/summary` | Get total daily calories & macro breakdown vs goals |
| `GET` | `/api/foods/search` | Search foods via USDA & internal foodItems collection |
| `GET` | `/api/foods/barcode/[code]` | Open Food Facts barcode nutrition lookup |
| `GET` | `/api/nutrition-goals` | Get user macro/calorie targets |
| `POST` | `/api/ai/food-image-log` | Analyze meal photo with vision AI & return nutrition log |

### 📈 Body Composition & Progress
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/measurements` | Fetch body measurements history |
| `POST` | `/api/measurements` | Log ad-hoc or monthly body composition assessment |
| `GET` | `/api/measurements/latest` | Fetch latest measurement entry |
| `GET` | `/api/measurements/compare` | Compare two measurement dates |
| `GET` | `/api/progress/summary` | Get weight change, volume progression & adherence summary |
| `POST` | `/api/ai/progress-analysis` | Generate AI progress analysis report & recommendations |

### 🤖 AI Coach & Recovery Protocols
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/ai/chat` | Send message to AI Coach (supports conversational food logging) |
| `GET` | `/api/ai/conversations` | List user AI chat threads |
| `GET` | `/api/ai/conversations/[id]` | Get chat thread messages |
| `GET` | `/api/recovery` | Fetch daily recovery score & strain metrics |
| `POST` | `/api/recovery/generate` | Compute daily recovery score & active recovery plan |
| `GET` | `/api/daily-activity` | Fetch rest-day activity logs |
| `POST` | `/api/daily-activity` | Log rest-day activity (walk, yoga, mobility) |

### ⏰ Background Crons & System
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET/POST` | `/api/cron/generate-weekly-plans` | Daily Vercel cron to auto-renew weekly plans (`CRON_SECRET`) |
| `POST` | `/api/cloudinary/sign` | Generate signed upload parameters for Cloudinary |
| `GET` | `/api/account/export` | Export all user data (GDPR compliant JSON) |

---

## 🛡️ License & Acknowledgments

This project is open-source under the [MIT License](LICENSE). Built with ❤️ by Abhishek Garg.
