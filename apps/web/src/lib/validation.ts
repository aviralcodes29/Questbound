import { z } from 'zod';

export const questCategories = [
  'study',
  'coding',
  'health',
  'reading',
  'mindfulness',
  'social',
  'creative',
] as const;

export const questDifficulties = ['easy', 'medium', 'hard', 'epic'] as const;

export const questSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Quest title is required')
    .max(120, 'Quest title must not exceed 120 characters'),
  description: z.string().max(1000, 'Description too long').default(''),
  category: z.enum(questCategories, {
    errorMap: () => ({ message: 'Please select a valid quest category' }),
  }),
  difficulty: z.enum(questDifficulties, {
    errorMap: () => ({ message: 'Please select a valid quest difficulty' }),
  }),
  estimated_minutes: z
    .number({ invalid_type_error: 'Estimated minutes must be a number' })
    .int('Minutes must be a whole number')
    .min(1, 'Minimum estimated duration is 1 minute')
    .max(1440, 'Maximum duration is 1440 minutes (24 hours)')
    .default(30),
  due_date: z
    .string()
    .nullable()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid due date format',
    }),
});

export type QuestFormData = z.infer<typeof questSchema>;

export const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(30).optional(),
});

export type AuthFormData = z.infer<typeof authSchema>;
