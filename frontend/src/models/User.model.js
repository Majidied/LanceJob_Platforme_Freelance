import { z } from 'zod';

export const UserSchema = z.object({
    FirstName: z.string().min(2).max(50).trim(),
    LastName: z.string().min(2).max(50).trim(),
    email: z.string().email().trim().toLowerCase(),
    password: z.string().min(6)
});

export const UserLoginSchema = z.object({
    email: z.string().email().trim().toLowerCase(),
    password: z.string().min(6)
});

export const User = UserSchema.extend({
    id: z.string().uuid(),
    role: z.enum(['client', 'freelancer']),
    createdAt: z.string(),
    updatedAt: z.string()
});

export const UserLogin = UserLoginSchema.extend({
    email: z.string().email().trim().toLowerCase(),
    password: z.string().min(6),
});