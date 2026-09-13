-- Questbound Life RPG Database Schema & Migration
-- Author: Questbound Team
-- Conforms to Life RPG Project Blueprint Specification

-- 1. ENUMS
CREATE TYPE quest_category AS ENUM (
  'study',
  'coding',
  'health',
  'reading',
  'mindfulness',
  'social',
  'creative'
);

CREATE TYPE quest_difficulty AS ENUM (
  'easy',
  'medium',
  'hard',
  'epic'
);

CREATE TYPE ledger_type AS ENUM (
  'quest_reward',
  'purchase',
  'adjustment'
);

-- 2. PROFILES TABLE
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  display_name text NOT NULL,
  avatar_url text,
  timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  xp bigint NOT NULL DEFAULT 0 CHECK (xp >= 0),
  level integer NOT NULL DEFAULT 1 CHECK (level >= 1),
  gold bigint NOT NULL DEFAULT 0 CHECK (gold >= 0),
  current_streak integer NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak integer NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_activity_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. ATTRIBUTES TABLE
CREATE TABLE attributes (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  intellect integer NOT NULL DEFAULT 1 CHECK (intellect >= 1),
  strength integer NOT NULL DEFAULT 1 CHECK (strength >= 1),
  wisdom integer NOT NULL DEFAULT 1 CHECK (wisdom >= 1),
  charisma integer NOT NULL DEFAULT 1 CHECK (charisma >= 1),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. QUESTS TABLE
CREATE TABLE quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(trim(title)) BETWEEN 1 AND 120),
  description text NOT NULL DEFAULT '',
  category quest_category NOT NULL,
  difficulty quest_difficulty NOT NULL DEFAULT 'medium',
  estimated_minutes integer CHECK (estimated_minutes BETWEEN 1 AND 1440),
  due_date date,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. QUEST COMPLETIONS TABLE
CREATE TABLE quest_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id uuid NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed_on date NOT NULL,
  xp_awarded integer NOT NULL CHECK (xp_awarded > 0),
  gold_awarded integer NOT NULL CHECK (gold_awarded > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (quest_id, completed_on)
);

-- 6. ATTRIBUTE EVENTS TABLE
CREATE TABLE attribute_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completion_id uuid NOT NULL REFERENCES quest_completions(id) ON DELETE CASCADE,
  attribute_name text NOT NULL,
  amount integer NOT NULL CHECK (amount > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. ITEMS TABLE (SHOP)
CREATE TABLE items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('theme', 'badge', 'avatar_frame', 'effect')),
  price integer NOT NULL CHECK (price >= 0),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true
);

-- 8. INVENTORY TABLE
CREATE TABLE inventory (
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  purchased_at timestamptz NOT NULL DEFAULT now(),
  equipped boolean NOT NULL DEFAULT false,
  PRIMARY KEY (user_id, item_id)
);

-- 9. GOLD LEDGER TABLE
CREATE TABLE gold_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  entry_type ledger_type NOT NULL,
  reference_id uuid,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_quests_user_active ON quests(user_id, is_archived);
CREATE INDEX idx_quest_completions_user ON quest_completions(user_id, completed_on);
CREATE INDEX idx_gold_ledger_user ON gold_ledger(user_id, created_at DESC);
CREATE INDEX idx_inventory_user ON inventory(user_id);

-- 10. ROW LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attribute_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold_ledger ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can select and update their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Attributes: Users can select their own attributes
CREATE POLICY "Users can read own attributes" ON attributes
  FOR SELECT USING (auth.uid() = user_id);

-- Quests: Users can CRUD their own quests
CREATE POLICY "Users can manage own quests" ON quests
  FOR ALL USING (auth.uid() = user_id);

-- Quest completions: Users can view their completions
CREATE POLICY "Users can read own completions" ON quest_completions
  FOR SELECT USING (auth.uid() = user_id);

-- Attribute events: Users can view their attribute events
CREATE POLICY "Users can read own attribute events" ON attribute_events
  FOR SELECT USING (auth.uid() = user_id);

-- Items: Everyone can read active items
CREATE POLICY "Anyone can view active items" ON items
  FOR SELECT USING (is_active = true);

-- Inventory: Users can view and manage their inventory (equip/unequip)
CREATE POLICY "Users can read own inventory" ON inventory
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update equipped state" ON inventory
  FOR UPDATE USING (auth.uid() = user_id);

-- Gold ledger: Users can view their own ledger history
CREATE POLICY "Users can read own gold ledger" ON gold_ledger
  FOR SELECT USING (auth.uid() = user_id);

-- 11. AUTH TRIGGER: AUTO CREATE PROFILE & ATTRIBUTES
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_username text;
  v_display_name text;
BEGIN
  v_username := COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4));
  v_display_name := COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1));

  INSERT INTO public.profiles (id, username, display_name, avatar_url, timezone)
  VALUES (
    new.id,
    v_username,
    v_display_name,
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(new.raw_user_meta_data->>'timezone', 'Asia/Kolkata')
  );

  INSERT INTO public.attributes (user_id, intellect, strength, wisdom, charisma)
  VALUES (new.id, 1, 1, 1, 1);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. HELPER RPG LEVEL CALCULATION
CREATE OR REPLACE FUNCTION public.calculate_required_xp(p_level integer)
RETURNS bigint AS $$
BEGIN
  RETURN floor(100.0 * (p_level::float ^ 1.55))::bigint;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 13. ATOMIC TRANSACTIONAL FUNCTION: COMPLETE QUEST
CREATE OR REPLACE FUNCTION public.complete_quest(p_quest_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_user_id uuid;
  v_quest RECORD;
  v_profile RECORD;
  v_timezone text;
  v_today date;
  v_xp_reward integer;
  v_gold_reward integer;
  v_attribute_name text;
  v_completion_id uuid;
  v_new_xp bigint;
  v_old_level integer;
  v_new_level integer;
  v_req_xp bigint;
  v_new_streak integer;
  v_longest_streak integer;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Fetch Quest with ownership check
  SELECT * INTO v_quest FROM quests
  WHERE id = p_quest_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quest not found or unauthorized';
  END IF;

  IF v_quest.is_archived THEN
    RAISE EXCEPTION 'Cannot complete archived quest';
  END IF;

  -- 2. Fetch Profile with lock to prevent race conditions
  SELECT * INTO v_profile FROM profiles
  WHERE id = v_user_id FOR UPDATE;

  v_timezone := COALESCE(v_profile.timezone, 'Asia/Kolkata');
  v_today := (timezone(v_timezone, now()))::date;

  -- 3. Check for duplicate completion today
  IF EXISTS (
    SELECT 1 FROM quest_completions
    WHERE quest_id = p_quest_id AND completed_on = v_today
  ) THEN
    RAISE EXCEPTION 'Quest already completed for today';
  END IF;

  -- 4. Calculate rewards based on difficulty
  CASE v_quest.difficulty
    WHEN 'easy' THEN
      v_xp_reward := 25;
      v_gold_reward := 10;
    WHEN 'medium' THEN
      v_xp_reward := 60;
      v_gold_reward := 25;
    WHEN 'hard' THEN
      v_xp_reward := 130;
      v_gold_reward := 55;
    WHEN 'epic' THEN
      v_xp_reward := 260;
      v_gold_reward := 110;
    ELSE
      v_xp_reward := 60;
      v_gold_reward := 25;
  END CASE;

  -- 5. Calculate attribute mapping
  CASE v_quest.category
    WHEN 'study', 'coding' THEN
      v_attribute_name := 'intellect';
    WHEN 'health' THEN
      v_attribute_name := 'strength';
    WHEN 'reading', 'mindfulness' THEN
      v_attribute_name := 'wisdom';
    WHEN 'social', 'creative' THEN
      v_attribute_name := 'charisma';
    ELSE
      v_attribute_name := 'intellect';
  END CASE;

  -- 6. Insert quest completion record
  INSERT INTO quest_completions (quest_id, user_id, completed_on, xp_awarded, gold_awarded)
  VALUES (p_quest_id, v_user_id, v_today, v_xp_reward, v_gold_reward)
  RETURNING id INTO v_completion_id;

  -- 7. Insert attribute event & increment attribute
  INSERT INTO attribute_events (user_id, completion_id, attribute_name, amount)
  VALUES (v_user_id, v_completion_id, v_attribute_name, 1);

  IF v_attribute_name = 'intellect' THEN
    UPDATE attributes SET intellect = intellect + 1, updated_at = now() WHERE user_id = v_user_id;
  ELSIF v_attribute_name = 'strength' THEN
    UPDATE attributes SET strength = strength + 1, updated_at = now() WHERE user_id = v_user_id;
  ELSIF v_attribute_name = 'wisdom' THEN
    UPDATE attributes SET wisdom = wisdom + 1, updated_at = now() WHERE user_id = v_user_id;
  ELSIF v_attribute_name = 'charisma' THEN
    UPDATE attributes SET charisma = charisma + 1, updated_at = now() WHERE user_id = v_user_id;
  END IF;

  -- 8. Record in gold ledger
  INSERT INTO gold_ledger (user_id, amount, entry_type, reference_id, description)
  VALUES (v_user_id, v_gold_reward, 'quest_reward', v_completion_id, 'Reward for completing quest: ' || v_quest.title);

  -- 9. Calculate level and XP progress
  v_old_level := v_profile.level;
  v_new_xp := v_profile.xp + v_xp_reward;
  v_new_level := v_old_level;

  LOOP
    v_req_xp := calculate_required_xp(v_new_level);
    IF v_new_xp >= v_req_xp THEN
      v_new_level := v_new_level + 1;
    ELSE
      EXIT;
    END IF;
  END LOOP;

  -- 10. Calculate streak
  IF v_profile.last_activity_date IS NULL THEN
    v_new_streak := 1;
  ELSIF v_profile.last_activity_date = v_today THEN
    v_new_streak := v_profile.current_streak;
  ELSIF v_profile.last_activity_date = (v_today - 1) THEN
    v_new_streak := v_profile.current_streak + 1;
  ELSE
    v_new_streak := 1;
  END IF;

  v_longest_streak := GREATEST(v_profile.longest_streak, v_new_streak);

  -- 11. Update profile with totals
  UPDATE profiles
  SET
    xp = v_new_xp,
    level = v_new_level,
    gold = v_profile.gold + v_gold_reward,
    current_streak = v_new_streak,
    longest_streak = v_longest_streak,
    last_activity_date = v_today,
    updated_at = now()
  WHERE id = v_user_id;

  -- 12. Return summary payload
  RETURN jsonb_build_object(
    'completionId', v_completion_id,
    'xpAwarded', v_xp_reward,
    'goldAwarded', v_gold_reward,
    'newXp', v_new_xp,
    'oldLevel', v_old_level,
    'newLevel', v_new_level,
    'streak', v_new_streak,
    'attribute', v_attribute_name,
    'attributeIncrease', 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. ATOMIC TRANSACTIONAL FUNCTION: PURCHASE ITEM
CREATE OR REPLACE FUNCTION public.purchase_item(p_item_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_user_id uuid;
  v_item RECORD;
  v_profile RECORD;
  v_remaining_gold bigint;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify item exists and is active
  SELECT * INTO v_item FROM items
  WHERE id = p_item_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item not available in Guild Shop';
  END IF;

  -- Check if user already owns it
  IF EXISTS (SELECT 1 FROM inventory WHERE user_id = v_user_id AND item_id = p_item_id) THEN
    RAISE EXCEPTION 'You already own this item';
  END IF;

  -- Lock profile to check and deduct gold
  SELECT * INTO v_profile FROM profiles
  WHERE id = v_user_id FOR UPDATE;

  IF v_profile.gold < v_item.price THEN
    RAISE EXCEPTION 'Insufficient gold! Required: %, You have: %', v_item.price, v_profile.gold;
  END IF;

  v_remaining_gold := v_profile.gold - v_item.price;

  -- Deduct gold from profile
  UPDATE profiles
  SET gold = v_remaining_gold, updated_at = now()
  WHERE id = v_user_id;

  -- Add to inventory
  INSERT INTO inventory (user_id, item_id, purchased_at, equipped)
  VALUES (v_user_id, p_item_id, now(), false);

  -- Record in ledger
  INSERT INTO gold_ledger (user_id, amount, entry_type, reference_id, description)
  VALUES (v_user_id, -v_item.price, 'purchase', p_item_id, 'Purchased shop item: ' || v_item.name);

  RETURN jsonb_build_object(
    'itemId', p_item_id,
    'remainingGold', v_remaining_gold
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
