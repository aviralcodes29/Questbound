import { QuestCategory, QuestDifficulty } from './types';

/**
 * Calculate required XP to reach the NEXT level from the current level.
 * Formula: floor(100 * level^1.55)
 */
export function calculateRequiredXp(level: number): number {
  if (level < 1) return 100;
  return Math.floor(100 * Math.pow(level, 1.55));
}

/**
 * Calculate the cumulative XP required to reach a specific level starting from level 1.
 */
export function calculateCumulativeXpForLevel(targetLevel: number): number {
  let total = 0;
  for (let l = 1; l < targetLevel; l++) {
    total += calculateRequiredXp(l);
  }
  return total;
}

/**
 * Calculate current level and level progress (XP in current level, XP required for current level)
 * given total accumulated XP.
 */
export function calculateLevelFromTotalXp(totalXp: number): {
  level: number;
  currentLevelXp: number;
  requiredXpForNext: number;
  progressPercent: number;
} {
  let currentLevel = 1;
  let remainingXp = Math.max(0, totalXp);

  while (true) {
    const needed = calculateRequiredXp(currentLevel);
    if (remainingXp >= needed) {
      remainingXp -= needed;
      currentLevel++;
    } else {
      break;
    }
  }

  const requiredForNext = calculateRequiredXp(currentLevel);
  const progressPercent = Math.min(100, Math.floor((remainingXp / requiredForNext) * 100));

  return {
    level: currentLevel,
    currentLevelXp: remainingXp,
    requiredXpForNext: requiredForNext,
    progressPercent,
  };
}

/**
 * Completion rewards based on difficulty
 */
export function getRewardsForDifficulty(difficulty: QuestDifficulty): {
  xp: number;
  gold: number;
} {
  switch (difficulty) {
    case 'easy':
      return { xp: 25, gold: 10 };
    case 'medium':
      return { xp: 60, gold: 25 };
    case 'hard':
      return { xp: 130, gold: 55 };
    case 'epic':
      return { xp: 260, gold: 110 };
    default:
      return { xp: 60, gold: 25 };
  }
}

/**
 * Attribute mapping based on quest category
 */
export function getAttributeForCategory(category: QuestCategory): 'intellect' | 'strength' | 'wisdom' | 'charisma' {
  switch (category) {
    case 'study':
    case 'coding':
      return 'intellect';
    case 'health':
      return 'strength';
    case 'reading':
    case 'mindfulness':
      return 'wisdom';
    case 'social':
    case 'creative':
      return 'charisma';
    default:
      return 'intellect';
  }
}

/**
 * Title / Rank based on hero level
 */
export function getRankTitle(level: number): { title: string; subtitle: string } {
  if (level < 3) return { title: 'Novice Adventurer', subtitle: 'Rank I Seeker' };
  if (level < 6) return { title: 'Apprentice Scout', subtitle: 'Rank II Pathfinder' };
  if (level < 10) return { title: 'Guild Journeyman', subtitle: 'Rank III Vanguard' };
  if (level < 15) return { title: 'Adept Sentinel', subtitle: 'Rank IV Guardian' };
  if (level < 20) return { title: 'Master of Deeds', subtitle: 'Rank V Exemplar' };
  if (level < 30) return { title: 'Guild Champion', subtitle: 'Rank VI Hero' };
  if (level < 50) return { title: 'Grand Archon', subtitle: 'Rank VII Sovereign' };
  return { title: 'Mythic Paragon', subtitle: 'Rank VIII Transcendent' };
}
