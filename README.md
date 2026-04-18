# PT Command - Heavy/Medium/Light Training Protocol

A professional-grade strength training tracker built with Next.js 16, TypeScript, Tailwind CSS v4, and Supabase. Features naval submarine theme and focuses on H/M/L training methodology.

## 🚀 Features

- **H/M/L Protocol**: Heavy/Medium/Light training structure
- **Live Workout Logging**: Adjustable weight/reps, rest timers, set tracking  
- **Naval Theme**: Dark submarine aesthetic with phosphor amber accents
- **PWA Ready**: Installable as mobile app
- **Real-time Sync**: Supabase backend with Row Level Security
- **TypeScript**: Full type safety throughout

## 🏗️ Architecture

**Frontend:**
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS v4
- Naval submarine design system

**Backend:**
- Supabase (PostgreSQL + Auth + RLS)
- Row Level Security policies
- Real-time subscriptions

**Deployment:**
- Vercel (recommended)
- PWA manifest for mobile installation

## 📁 Project Structure

```
pt-command/
├── app/                    # Next.js App Router
│   ├── globals.css        # Naval theme + Tailwind
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main PT Command app
├── lib/
│   └── supabase/          # Supabase client configs
├── types/
│   └── database.ts        # TypeScript database types
├── supabase/
│   └── migrations/        # Database schema
└── public/
    └── manifest.json      # PWA configuration
```

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
git clone [repository-url]
cd pt-command
npm install
```

### 2. Supabase Setup

**Create Supabase Project:**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note your project URL and anon key

**Run Database Migration:**
```bash
# Copy the SQL from supabase/migrations/001_initial_schema.sql
# Paste it into Supabase SQL Editor and run
```

This creates:
- User lifts (1RMs and training maxes)
- Programs (H/M/L templates)  
- Workouts (sessions)
- Workout sets (individual set logging)
- Week progression tracking
- RLS policies for data security

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Development

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🚀 Deployment

### Deploy to Vercel (Recommended)

**Option 1: GitHub Integration**
1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy automatically

**Option 2: Vercel CLI**
```bash
npm install -g vercel
vercel --prod
```

### Deploy to Custom Domain

Like `pt.keeply.boats`:

1. **DNS Setup:**
   ```
   CNAME pt vercel-domain.vercel.app
   ```

2. **Vercel Domain:**
   ```bash
   vercel domains add pt.keeply.boats
   ```

3. **Environment Variables:**
   ```
   NEXT_PUBLIC_APP_URL=https://pt.keeply.boats
   ```

## 📱 Mobile App (PWA)

PT Command is PWA-ready for mobile installation:

**Installation:**
1. Visit app in mobile browser
2. "Add to Home Screen" prompt
3. Installs like native app

**Features:**
- Offline-capable
- Full-screen experience  
- App icon on home screen
- Native mobile feel

## 🗄️ Database Schema

**Core Tables:**
- `user_lifts` - 1RM and training max tracking
- `programs` - H/M/L workout templates
- `workouts` - Training sessions
- `workout_sets` - Individual set logging
- `week_progression` - Weekly completion tracking

**Default Programs:**
- **Heavy Day**: Deadlifts + Bench Press + KB Swings (3×20 for time)
- **Light Day**: Squats + OHP + KB Swings (10×20, 1min rest)
- **Medium Day**: Squats + OHP + KB Swings (10×10, 1min rest)

## 🎨 Naval Theme

**Color System:**
- **Hull colors** (backgrounds): `#090e12` → `#f0f4f8`
- **Amber accents**: `#c89828` (primary)
- **Status colors**: Success `#48986a`, Warning `#c09838`, Danger `#c07060`

**Typography:**
- **Primary**: Space Grotesk (modern geometric)
- **Monospace**: JetBrains Mono (code/numbers)

## 🔧 Development

**Key Commands:**
```bash
npm run dev          # Development server
npm run build        # Production build  
npm run start        # Production server
npm run type-check   # TypeScript validation
npm run lint         # ESLint
```

**Adding New Features:**
1. Database changes in `/supabase/migrations/`
2. Update TypeScript types in `/types/database.ts`
3. Add components in `/app/` with naval theme classes

## 🔐 Security

- Row Level Security (RLS) on all tables
- User-based data isolation
- Secure authentication via Supabase Auth
- Environment variables for sensitive keys

## 📊 Workout Flow

1. **Today Tab**: Current workout with live logging
2. **Set Tracking**: Prescribed vs actual weight/reps
3. **Rest Timers**: Auto-start based on exercise
4. **Exercise Progression**: Deadlifts → Bench → KB Swings
5. **Session Completion**: Track total workout time

## 🚀 Future Features

- **Program Editor**: Customize upcoming workouts
- **History Tracking**: Past session analysis
- **Progress Charts**: 1RM progression graphs
- **Plate Calculator**: Loading calculator
- **Social Features**: Share PRs and workouts

## 📄 License

Private project - All rights reserved

---

**PT Command** - Professional strength training for the modern lifter 💪⚓
