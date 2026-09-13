import { describe, it, expect } from 'vitest';
import { questSchema, authSchema } from '../lib/validation';

describe('Zod Validation Schemas', () => {
  it('validates correct quest payload successfully', () => {
    const valid = {
      title: 'Complete Python practice set',
      description: 'Solve 3 algorithmic challenges',
      category: 'coding',
      difficulty: 'medium',
      estimated_minutes: 45,
      due_date: '2026-09-15',
    };
    const res = questSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('rejects empty or whitespace-only quest title', () => {
    const emptyTitle = {
      title: '   ',
      category: 'coding',
      difficulty: 'medium',
      estimated_minutes: 30,
    };
    const res = questSchema.safeParse(emptyTitle);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.errors[0].message).toContain('Quest title is required');
    }
  });

  it('rejects quest title exceeding 120 characters', () => {
    const longTitle = {
      title: 'A'.repeat(121),
      category: 'coding',
      difficulty: 'medium',
      estimated_minutes: 30,
    };
    const res = questSchema.safeParse(longTitle);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.errors[0].message).toContain('must not exceed 120 characters');
    }
  });

  it('rejects invalid estimated minutes (less than 1 or greater than 1440)', () => {
    const zeroMin = {
      title: 'Quick meditation',
      category: 'mindfulness',
      difficulty: 'easy',
      estimated_minutes: 0,
    };
    expect(questSchema.safeParse(zeroMin).success).toBe(false);

    const tooLong = {
      title: 'Marathon session',
      category: 'study',
      difficulty: 'hard',
      estimated_minutes: 2000,
    };
    expect(questSchema.safeParse(tooLong).success).toBe(false);
  });

  it('validates auth schema requires valid email and at least 6-character password', () => {
    expect(authSchema.safeParse({ email: 'invalid', password: '123' }).success).toBe(false);
    expect(authSchema.safeParse({ email: 'adventurer@guild.com', password: '123' }).success).toBe(false);
    expect(authSchema.safeParse({ email: 'adventurer@guild.com', password: 'secretpassword' }).success).toBe(true);
  });
});
