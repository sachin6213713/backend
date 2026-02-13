import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().trim().email('Invalid email').max(255, 'Email too long'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128, 'Password too long'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().trim().max(2000, 'Description too long').optional().default(''),
  status: z.enum(['pending', 'completed']).optional().default('pending'),
  dueDate: z.string().datetime().optional().or(z.string().pipe(z.coerce.date()).optional()),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(['pending', 'completed']).optional(),
  dueDate: z.string().datetime().optional().or(z.string().pipe(z.coerce.date()).optional()).nullable(),
});
