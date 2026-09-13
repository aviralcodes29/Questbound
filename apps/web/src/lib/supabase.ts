import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Profile,
  Attributes,
  Quest,
  QuestCompletion,
  ShopItem,
  InventoryItem,
  GoldLedgerEntry,
  RewardSummary,
  QuestCategory,
  QuestDifficulty,
} from './types';
import { getRewardsForDifficulty, getAttributeForCategory, calculateRequiredXp } from './rpg';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-public-key')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// SEED ITEMS (Matches supabase/seed.sql)
// ==========================================
export const SEED_SHOP_ITEMS: ShopItem[] = [
  {
    id: 'item-theme-moonlit',
    slug: 'theme-moonlit-guild',
    name: 'Moonlit Guild Hall',
    description: 'The classical aesthetic of the guild hall bathed in midnight azure and astral cyan.',
    item_type: 'theme',
    price: 0,
    metadata: { themeId: 'moonlit', primaryColor: '#6ee7f9', bgColor: '#0b1020', surfaceColor: '#151d32' },
    is_active: true,
  },
  {
    id: 'item-theme-solar',
    slug: 'theme-solar-sanctum',
    name: 'Solar Sanctum',
    description: 'A radiant daylight sanctuary filled with golden sunlight and warm sandstone glow.',
    item_type: 'theme',
    price: 150,
    metadata: { themeId: 'solar', primaryColor: '#f6c453', bgColor: '#14100c', surfaceColor: '#221a14' },
    is_active: true,
  },
  {
    id: 'item-theme-shadow',
    slug: 'theme-shadow-grove',
    name: 'Shadow Grove',
    description: 'An ancient mystical grove shrouded in bioluminescent emerald moss and obsidian night.',
    item_type: 'theme',
    price: 200,
    metadata: { themeId: 'shadow', primaryColor: '#78e6a0', bgColor: '#0a1612', surfaceColor: '#13241d' },
    is_active: true,
  },
  {
    id: 'item-badge-novice',
    slug: 'badge-novice-adventurer',
    name: 'Novice Adventurer',
    description: 'Awarded to courageous seekers who take their very first steps into the guild.',
    item_type: 'badge',
    price: 25,
    metadata: { icon: 'Compass', rarity: 'common', color: '#6ee7f9' },
    is_active: true,
  },
  {
    id: 'item-badge-iron',
    slug: 'badge-iron-will',
    name: 'Iron Will',
    description: 'Forged through relentless consistency, discipline, and unstoppable habit streaks.',
    item_type: 'badge',
    price: 75,
    metadata: { icon: 'Flame', rarity: 'rare', color: '#f6c453' },
    is_active: true,
  },
  {
    id: 'item-badge-archivist',
    slug: 'badge-grand-archivist',
    name: 'Grand Archivist',
    description: 'The seal of profound intellect and scholarly devotion to life quests.',
    item_type: 'badge',
    price: 120,
    metadata: { icon: 'BookOpen', rarity: 'epic', color: '#c084fc' },
    is_active: true,
  },
  {
    id: 'item-frame-laurel',
    slug: 'frame-laurel-of-dawn',
    name: 'Laurel of Dawn',
    description: 'A circular crest interwoven with silver enchanted leaves.',
    item_type: 'avatar_frame',
    price: 50,
    metadata: { borderStyle: 'double', borderColor: '#6ee7f9', glow: '0 0 15px rgba(110, 231, 249, 0.5)' },
    is_active: true,
  },
  {
    id: 'item-frame-obsidian',
    slug: 'frame-obsidian-crest',
    name: 'Obsidian Crest',
    description: 'Sharpened volcanic rune edges that shimmer with dark defensive energy.',
    item_type: 'avatar_frame',
    price: 100,
    metadata: { borderStyle: 'solid', borderColor: '#94a3b8', glow: '0 0 15px rgba(148, 163, 184, 0.4)' },
    is_active: true,
  },
  {
    id: 'item-frame-halo',
    slug: 'frame-starlight-halo',
    name: 'Starlight Halo',
    description: 'A celestial orbital ring that pulses with cosmic stardust.',
    item_type: 'avatar_frame',
    price: 180,
    metadata: { borderStyle: 'dashed', borderColor: '#f6c453', glow: '0 0 20px rgba(246, 196, 83, 0.6)' },
    is_active: true,
  },
  {
    id: 'item-effect-starlight',
    slug: 'effect-starlight-burst',
    name: 'Starlight Burst',
    description: 'Summons prismatic cosmic star particles whenever you complete a quest.',
    item_type: 'effect',
    price: 80,
    metadata: { particles: ['★', '✦', '✧'], colors: ['#6ee7f9', '#ffffff', '#c084fc'] },
    is_active: true,
  },
  {
    id: 'item-effect-dragonfire',
    slug: 'effect-dragonfire-spark',
    name: 'Dragonfire Sparks',
    description: 'Ignites molten gold embers and fiery celebration blasts upon triumph.',
    item_type: 'effect',
    price: 140,
    metadata: { particles: ['🔥', '✨', '💥'], colors: ['#f6c453', '#ff8b7b', '#f97316'] },
    is_active: true,
  },
];

// ==========================================
// SIMULATED LOCAL RPG DATABASE SERVICE
// (Exact replica of Postgres RLS & RPC functions)
// ==========================================
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

interface LocalDatabaseState {
  profile: Profile;
  attributes: Attributes;
  quests: Quest[];
  completions: QuestCompletion[];
  inventory: InventoryItem[];
  ledger: GoldLedgerEntry[];
}

const STORAGE_KEY = 'questbound_local_db_v1';

function getTodayString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function getDefaultState(): LocalDatabaseState {
  const today = getTodayString();
  return {
    profile: {
      id: DEMO_USER_ID,
      username: 'adventurer',
      display_name: 'Guild Adventurer',
      avatar_url: '',
      timezone: 'Asia/Kolkata',
      xp: 45,
      level: 1,
      gold: 50,
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    attributes: {
      user_id: DEMO_USER_ID,
      intellect: 2,
      strength: 1,
      wisdom: 1,
      charisma: 1,
      updated_at: new Date().toISOString(),
    },
    quests: [
      {
        id: 'quest-sample-1',
        user_id: DEMO_USER_ID,
        title: 'Complete Python practice set',
        description: 'Solve 3 algorithmic exercises on array manipulations and hash maps.',
        category: 'coding',
        difficulty: 'medium',
        estimated_minutes: 45,
        due_date: today,
        is_archived: false,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'quest-sample-2',
        user_id: DEMO_USER_ID,
        title: 'Morning 20-min cardio run',
        description: 'Hit the trail or treadmill before starting the workday.',
        category: 'health',
        difficulty: 'easy',
        estimated_minutes: 20,
        due_date: today,
        is_archived: false,
        created_at: new Date(Date.now() - 7200000).toISOString(),
        updated_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'quest-sample-3',
        user_id: DEMO_USER_ID,
        title: 'Read chapter 4 of Clean Code',
        description: 'Study meaningful formatting and comment etiquette in software design.',
        category: 'reading',
        difficulty: 'hard',
        estimated_minutes: 60,
        due_date: null,
        is_archived: false,
        created_at: new Date(Date.now() - 10800000).toISOString(),
        updated_at: new Date(Date.now() - 10800000).toISOString(),
      },
    ],
    completions: [],
    inventory: [
      {
        user_id: DEMO_USER_ID,
        item_id: 'item-theme-moonlit',
        purchased_at: new Date().toISOString(),
        equipped: true,
      },
    ],
    ledger: [
      {
        id: 'ledger-initial',
        user_id: DEMO_USER_ID,
        amount: 50,
        entry_type: 'adjustment',
        reference_id: null,
        description: 'Starting Guild Sign-on Bonus',
        created_at: new Date().toISOString(),
      },
    ],
  };
}

class LocalDatabase {
  private state: LocalDatabaseState;

  constructor() {
    this.state = this.load();
  }

  private load(): LocalDatabaseState {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load local DB', e);
    }
    const def = getDefaultState();
    this.save(def);
    return def;
  }

  private save(state: LocalDatabaseState): void {
    try {
      this.state = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save local DB', e);
    }
  }

  public reset(): void {
    const def = getDefaultState();
    this.save(def);
  }

  public getProfile(): Profile {
    return this.state.profile;
  }

  public updateProfile(updates: Partial<Profile>): Profile {
    this.state.profile = { ...this.state.profile, ...updates, updated_at: new Date().toISOString() };
    this.save(this.state);
    return this.state.profile;
  }

  public getAttributes(): Attributes {
    return this.state.attributes;
  }

  public getQuests(): Quest[] {
    const today = getTodayString();
    const completedQuestIds = new Set(
      this.state.completions.filter((c) => c.completed_on === today).map((c) => c.quest_id)
    );
    return this.state.quests.map((q) => ({
      ...q,
      is_completed_today: completedQuestIds.has(q.id),
    }));
  }

  public createQuest(quest: Omit<Quest, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_archived'>): Quest {
    const newQuest: Quest = {
      ...quest,
      id: 'quest-' + Math.random().toString(36).substring(2, 9),
      user_id: this.state.profile.id,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_completed_today: false,
    };
    this.state.quests.unshift(newQuest);
    this.save(this.state);
    return newQuest;
  }

  public updateQuest(id: string, updates: Partial<Quest>): Quest {
    const idx = this.state.quests.findIndex((q) => q.id === id);
    if (idx === -1) throw new Error('Quest not found');
    this.state.quests[idx] = {
      ...this.state.quests[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.save(this.state);
    return this.state.quests[idx];
  }

  public deleteQuest(id: string): void {
    this.state.quests = this.state.quests.filter((q) => q.id !== id);
    this.save(this.state);
  }

  public completeQuest(questId: string): RewardSummary {
    const today = getTodayString();
    const quest = this.state.quests.find((q) => q.id === questId);
    if (!quest) throw new Error('Quest not found');
    if (quest.is_archived) throw new Error('Cannot complete archived quest');

    // Duplicate check
    const alreadyDone = this.state.completions.some(
      (c) => c.quest_id === questId && c.completed_on === today
    );
    if (alreadyDone) {
      throw new Error('Quest has already been completed today!');
    }

    const { xp: xpAwarded, gold: goldAwarded } = getRewardsForDifficulty(quest.difficulty);
    const attrName = getAttributeForCategory(quest.category);

    const completionId = 'comp-' + Math.random().toString(36).substring(2, 9);
    this.state.completions.push({
      id: completionId,
      quest_id: questId,
      user_id: this.state.profile.id,
      completed_on: today,
      xp_awarded: xpAwarded,
      gold_awarded: goldAwarded,
      created_at: new Date().toISOString(),
    });

    // Increment attribute
    this.state.attributes[attrName] += 1;
    this.state.attributes.updated_at = new Date().toISOString();

    // Record in ledger
    this.state.ledger.unshift({
      id: 'led-' + Math.random().toString(36).substring(2, 9),
      user_id: this.state.profile.id,
      amount: goldAwarded,
      entry_type: 'quest_reward',
      reference_id: completionId,
      description: `Completed: ${quest.title}`,
      created_at: new Date().toISOString(),
    });

    // Level progression
    const oldLevel = this.state.profile.level;
    let newXp = this.state.profile.xp + xpAwarded;
    let newLevel = oldLevel;

    while (true) {
      const req = calculateRequiredXp(newLevel);
      if (newXp >= req) {
        newLevel += 1;
      } else {
        break;
      }
    }

    // Streak calculation
    let newStreak = this.state.profile.current_streak;
    const lastDate = this.state.profile.last_activity_date;
    if (!lastDate) {
      newStreak = 1;
    } else if (lastDate === today) {
      // already completed a quest today, streak remains same
      newStreak = this.state.profile.current_streak;
    } else {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (lastDate === yesterday) {
        newStreak = this.state.profile.current_streak + 1;
      } else {
        newStreak = 1;
      }
    }

    const longestStreak = Math.max(this.state.profile.longest_streak, newStreak);

    this.state.profile = {
      ...this.state.profile,
      xp: newXp,
      level: newLevel,
      gold: this.state.profile.gold + goldAwarded,
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_activity_date: today,
      updated_at: new Date().toISOString(),
    };

    this.save(this.state);

    return {
      completionId,
      xpAwarded,
      goldAwarded,
      newXp,
      oldLevel,
      newLevel,
      streak: newStreak,
      attribute: attrName,
      attributeIncrease: 1,
    };
  }

  public getShopItems(): ShopItem[] {
    return SEED_SHOP_ITEMS;
  }

  public getInventory(): InventoryItem[] {
    return this.state.inventory.map((inv) => ({
      ...inv,
      item: SEED_SHOP_ITEMS.find((s) => s.id === inv.item_id),
    }));
  }

  public purchaseItem(itemId: string): { itemId: string; remainingGold: number } {
    const item = SEED_SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) throw new Error('Item not found in Guild Shop');

    const alreadyOwned = this.state.inventory.some((i) => i.item_id === itemId);
    if (alreadyOwned) throw new Error('You already own this item');

    if (this.state.profile.gold < item.price) {
      throw new Error(`Insufficient Gold! Requires ${item.price} Gold, but you have ${this.state.profile.gold}.`);
    }

    const remainingGold = this.state.profile.gold - item.price;
    this.state.profile.gold = remainingGold;
    this.state.profile.updated_at = new Date().toISOString();

    this.state.inventory.push({
      user_id: this.state.profile.id,
      item_id: itemId,
      purchased_at: new Date().toISOString(),
      equipped: false,
    });

    this.state.ledger.unshift({
      id: 'led-' + Math.random().toString(36).substring(2, 9),
      user_id: this.state.profile.id,
      amount: -item.price,
      entry_type: 'purchase',
      reference_id: itemId,
      description: `Purchased: ${item.name}`,
      created_at: new Date().toISOString(),
    });

    this.save(this.state);
    return { itemId, remainingGold };
  }

  public toggleEquipItem(itemId: string): InventoryItem[] {
    const targetItem = SEED_SHOP_ITEMS.find((i) => i.id === itemId);
    if (!targetItem) throw new Error('Item not found');

    this.state.inventory = this.state.inventory.map((inv) => {
      const currentItem = SEED_SHOP_ITEMS.find((i) => i.id === inv.item_id);
      if (inv.item_id === itemId) {
        return { ...inv, equipped: !inv.equipped };
      }
      // If same item_type, unequip others of the same type (single active theme, badge, frame, etc.)
      if (currentItem && currentItem.item_type === targetItem.item_type) {
        return { ...inv, equipped: false };
      }
      return inv;
    });

    this.save(this.state);
    return this.getInventory();
  }

  public getCompletions(): QuestCompletion[] {
    return this.state.completions;
  }

  public getLedger(): GoldLedgerEntry[] {
    return this.state.ledger;
  }
}

export const localDb = new LocalDatabase();
