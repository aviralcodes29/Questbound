# Questbound Walkthrough Script

**Target duration:** ~120 seconds  
**Theme:** Moonlit Guild Hall  

---

### Segment 1: Landing Page & Lore (0:00 - 0:15)
- **Visual:** Open browser to the Questbound landing page.
- **Narrative:** "Welcome to Questbound, a fantasy-themed life RPG that turns everyday habits, learning, and fitness into an epic adventure. Notice the Moonlit Guild Hall aesthetic—crafted with deep navy `#0b1020`, radiant Essence cyan, and Guild Gold."
- **Action:** Highlight the call-to-action buttons ("Enter the Guild Hall" / "Quick Demo Access").

---

### Segment 2: Authentication & Protected Dashboard (0:15 - 0:35)
- **Visual:** Sign up with email or use the instant Demo Adventurer login.
- **Narrative:** "Questbound uses Supabase Auth with Row Level Security. Every user's quests, gold, and attributes are completely isolated at the database level. Let's enter our hero's sanctuary."
- **Action:** Transition smoothly into the protected dashboard. The Hero Card animates into view displaying Level 1, Essence bar, streak flame, and gold balance.

---

### Segment 3: Quest Creation & Validation (0:35 - 0:55)
- **Visual:** Click "Forge New Quest".
- **Narrative:** "Let's forge a real-world task. All inputs are validated with Zod on both client and server."
- **Action:**
  1. Try submitting empty form to showcase accessible validation errors.
  2. Input:
     - **Title:** `Complete Python practice set`
     - **Category:** `Coding` (which increases Intellect)
     - **Difficulty:** `Medium` (rewards 60 XP and 25 Gold)
     - **Estimated Time:** `45 minutes`
  3. Click "Accept Quest". The card slides into "Today's Quests" with category icon and difficulty badge.

---

### Segment 4: Quest Completion, Progression & Level-Up (0:55 - 1:20)
- **Visual:** Click "Complete Quest".
- **Narrative:** "When we complete a quest, the backend triggers an atomic transaction. XP is awarded, gold is deposited into our ledger, streak increases, and attribute points are granted."
- **Action:**
  1. The complete button glows mint green.
  2. Synthesized Web Audio chime sounds as cosmic Essence particles float toward the Hero Card.
  3. Essence gauge fills up, triggering the **Level Up modal: New Rank Unlocked!** with confetti celebration.
  4. Attempting to complete the same quest again is prevented by server-side daily completion locks.

---

### Segment 5: Guild Shop & Inventory (1:20 - 1:40)
- **Visual:** Navigate to the **Guild Shop**.
- **Narrative:** "Quests earn us Gold, which we spend in the Guild Shop. Purchases are validated strictly server-side against our ledger."
- **Action:**
  1. Inspect seed items: Badges, Avatar Frames, Guild Themes, and Effects.
  2. Purchase the **Novice Adventurer** badge (or **Laurel of Dawn** frame).
  3. Notice the gold counter ticks down and the item immediately updates to 'Owned'.
  4. Click "Equip": Hero Card updates with the equipped frame/badge. Switch to **Solar Sanctum** theme to show live theme switching.

---

### Segment 6: Daily Chronicle & Persistence Check (1:40 - 2:00)
- **Visual:** Open the **Daily Chronicle**.
- **Narrative:** "The Daily Chronicle provides a heatmap of quest completions across calendar days, alongside a tamper-evident audit ledger of XP and gold."
- **Action:**
  1. Inspect the activity heatmap and transaction log entries.
  2. **Hard Refresh the Browser** (Ctrl + R / F5): Show that XP, Level, Gold, Streak, Attributes, Quests, and Inventory persist flawlessly.
  3. Toggle mobile viewport and navigate using keyboard (`Tab`, `Space`, `Esc`) to demonstrate full accessibility and responsive design.

---

### Summary Checklist for Video Walkthrough
- [x] Landing page and dark fantasy theme shown
- [x] Auth and RLS-backed data isolation explained
- [x] Quest CRUD with Zod validation
- [x] Real-time progression, Web Audio effects, Level-Up celebration
- [x] Shop purchase and inventory equip
- [x] Daily Chronicle calendar and ledger audit
- [x] Refresh persistence demonstrated
- [x] Mobile layout and keyboard accessibility tested
