export type QuestCategory =
  | 'study'
  | 'coding'
  | 'health'
  | 'reading'
  | 'mindfulness'
  | 'social'
  | 'creative';

export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'epic';

export type LedgerType = 'quest_reward' | 'purchase' | 'adjustment';

export type ItemType = 'theme' | 'badge' | 'avatar_frame' | 'effect';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  timezone: string;
  xp: number;
  level: number;
  gold: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Attributes {
  user_id: string;
  intellect: number;
  strength: number;
  wisdom: number;
  charisma: number;
  updated_at: string;
}

export interface Quest {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  estimated_minutes: number;
  due_date: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  // Computed fields
  is_completed_today?: boolean;
}

export interface QuestCompletion {
  id: string;
  quest_id: string;
  user_id: string;
  completed_on: string;
  xp_awarded: number;
  gold_awarded: number;
  created_at: string;
}

export interface AttributeEvent {
  id: string;
  user_id: string;
  completion_id: string;
  attribute_name: 'intellect' | 'strength' | 'wisdom' | 'charisma';
  amount: number;
  created_at: string;
}

export interface ShopItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  item_type: ItemType;
  price: number;
  metadata: Record<string, any>;
  is_active: boolean;
}

export interface InventoryItem {
  user_id: string;
  item_id: string;
  purchased_at: string;
  equipped: boolean;
  item?: ShopItem;
}

export interface GoldLedgerEntry {
  id: string;
  user_id: string;
  amount: number;
  entry_type: LedgerType;
  reference_id: string | null;
  description: string;
  created_at: string;
}

export interface RewardSummary {
  completionId: string;
  xpAwarded: number;
  goldAwarded: number;
  newXp: number;
  oldLevel: number;
  newLevel: number;
  streak: number;
  attribute: string;
  attributeIncrease: number;
}
