# Questbound — Life RPG

Questbound turns real-world goals and daily habits into rewarding RPG quests. Slay procrastination, conquer habits, earn Essence (XP) and Gold, upgrade character attributes, and unlock legendary guild cosmetics.

---

## ✨ Features

- **Supabase Authentication**: Secure email/password login, signup, session restoration, and password management.
- **PostgreSQL Persistence & Row Level Security (RLS)**: Strict user data isolation—every query is verified against `auth.uid()`.
- **Quest Management (CRUD)**: Create, view, filter (Active, Completed, Overdue, Archived), edit, and delete quests with Zod schema validation.
- **Non-Linear RPG Progression**:
  $$\text{requiredXp}(\text{level}) = \lfloor 100 \times \text{level}^{1.55} \rfloor$$
  Difficulty-based rewards (Easy, Medium, Hard, Epic) with server-side calculation and transaction integrity.
- **Attribute System**: Real-life categories boost core RPG stats:
  - *Study & Coding* $\rightarrow$ **Intellect**
  - *Gym & Health* $\rightarrow$ **Strength**
  - *Reading & Mindfulness* $\rightarrow$ **Wisdom**
  - *Social & Creative* $\rightarrow$ **Charisma**
- **Streak Tracker & Timezone Boundaries**: Calendar-accurate streak counting based on the adventurer's configured timezone.
- **Guild Shop & Inventory**: Server-verified gold balance checks. Unlock avatar frames, badges, themes (*Moonlit Guild*, *Solar Sanctum*, *Shadow Grove*), and custom particle effects.
- **Daily Chronicle**: Visual activity calendar and tamper-resistant transaction ledger.
- **Tactile Guild Hall UI**: "Moonlit Guild Hall" dark fantasy design system, native Web Audio API synthesized fanfares, particle bursts, keyboard navigation, and full `prefers-reduced-motion` accessibility.
- **Instant Preview / Demo Mode**: Built-in mock provider that mirrors the exact same schema, transactions, and formulas for instant evaluation or offline play.

---

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Canvas Confetti
- **Backend & Database**: Supabase (PostgreSQL 15), Row Level Security, Triggers, Atomic RPC Functions
- **Validation**: Zod (shared client and server schemas)
- **Audio Engine**: Web Audio API oscillator synthesis
- **Testing**: Vitest

---

## 🚀 Local Setup

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/questbound.git
cd questbound
npm install
cd apps/web
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` inside `apps/web/`:
```bash
cp .env.example .env.local
```
Fill in your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```
*(If no Supabase credentials are provided, Questbound seamlessly activates its simulated database mode so you can test all features immediately!)*

### 3. Run Supabase Migrations
If using Supabase:
1. Run `supabase/migrations/20260913000000_init_questbound.sql` in the Supabase SQL Editor.
2. Run `supabase/seed.sql` to populate the Guild Shop items.
3. Optionally deploy edge functions:
   ```bash
   supabase functions deploy complete-quest
   supabase functions deploy purchase-item
   ```

### 4. Start Development Server
```bash
# In questbound root or apps/web
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Running Automated Tests
```bash
cd apps/web
npm run test
```

---

## 📋 Walkthrough Guide
For a scripted 120-second evaluator walkthrough, see [`docs/walkthrough-script.md`](./docs/walkthrough-script.md).
