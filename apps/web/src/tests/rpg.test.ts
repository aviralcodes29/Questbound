import { describe, it, expect } from 'vitest';
import {
  calculateRequiredXp,
  calculateLevelFromTotalXp,
  getRewardsForDifficulty,
  getAttributeForCategory,
  getRankTitle,
} from '../lib/rpg';
import { SEED_SHOP_ITEMS } from '../lib/supabase';

describe('RPG Mechanics & Level Formulas', () => {
  it('calculates required XP using the non-linear formula floor(100 * level^1.55)', () => {
    // Level 1: floor(100 * 1^1.55) = 100
    expect(calculateRequiredXp(1)).toBe(100);

    // Level 2: floor(100 * 2^1.55) = floor(100 * 2.928) = 292
    expect(calculateRequiredXp(2)).toBe(292);

    // Level 5: floor(100 * 5^1.55) = floor(100 * 12.115) = 1211
    expect(calculateRequiredXp(5)).toBe(1211);

    // Level 10: floor(100 * 10^1.55) = floor(100 * 35.48) = 3548
    expect(calculateRequiredXp(10)).toBe(3548);
  });

  it('correctly calculates level and remaining XP from total accumulated XP', () => {
    // Total 0 XP -> Level 1, 0 XP, needs 100
    const lv0 = calculateLevelFromTotalXp(0);
    expect(lv0.level).toBe(1);
    expect(lv0.currentLevelXp).toBe(0);
    expect(lv0.requiredXpForNext).toBe(100);

    // Total 99 XP -> Level 1, 99 XP, needs 100
    const lv99 = calculateLevelFromTotalXp(99);
    expect(lv99.level).toBe(1);
    expect(lv99.currentLevelXp).toBe(99);

    // Total 100 XP -> Reached Level 2! (100 XP consumed for Lv1, 0 remaining)
    const lv100 = calculateLevelFromTotalXp(100);
    expect(lv100.level).toBe(2);
    expect(lv100.currentLevelXp).toBe(0);
    expect(lv100.requiredXpForNext).toBe(292);
  });

  it('provides exact rewards defined in specification for each difficulty', () => {
    expect(getRewardsForDifficulty('easy')).toEqual({ xp: 25, gold: 10 });
    expect(getRewardsForDifficulty('medium')).toEqual({ xp: 60, gold: 25 });
    expect(getRewardsForDifficulty('hard')).toEqual({ xp: 130, gold: 55 });
    expect(getRewardsForDifficulty('epic')).toEqual({ xp: 260, gold: 110 });
  });

  it('correctly maps quest disciplines to core RPG character attributes', () => {
    expect(getAttributeForCategory('coding')).toBe('intellect');
    expect(getAttributeForCategory('study')).toBe('intellect');
    expect(getAttributeForCategory('health')).toBe('strength');
    expect(getAttributeForCategory('reading')).toBe('wisdom');
    expect(getAttributeForCategory('mindfulness')).toBe('wisdom');
    expect(getAttributeForCategory('social')).toBe('charisma');
    expect(getAttributeForCategory('creative')).toBe('charisma');
  });

  it('ranks heroes appropriately based on ascended level', () => {
    expect(getRankTitle(1).title).toBe('Novice Adventurer');
    expect(getRankTitle(5).title).toBe('Apprentice Scout');
    expect(getRankTitle(10).title).toBe('Adept Sentinel');
    expect(getRankTitle(25).title).toBe('Guild Champion');
  });

  it('ensures seed shop items meet requirements: at least 8 items across 4 categories', () => {
    expect(SEED_SHOP_ITEMS.length).toBeGreaterThanOrEqual(8);

    const categories = new Set(SEED_SHOP_ITEMS.map((i) => i.item_type));
    expect(categories.has('theme')).toBe(true);
    expect(categories.has('badge')).toBe(true);
    expect(categories.has('avatar_frame')).toBe(true);
    expect(categories.has('effect')).toBe(true);

    // Unique slugs
    const slugs = SEED_SHOP_ITEMS.map((i) => i.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
