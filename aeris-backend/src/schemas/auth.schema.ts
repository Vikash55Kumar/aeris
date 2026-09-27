import { z } from 'zod';

export const LoginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address format'),
    password: z.string().min(1, 'Password is required'),
    role: z.enum(['ADMIN', 'DISPATCHER', 'GUEST']).optional(),
  }),
});

export const RegisterSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name is required'),
    subtitle: z.string().optional(),
    agencyName: z.string().optional(),
    role: z.enum(['ADMIN', 'DISPATCHER', 'GUEST']).default('GUEST'),
    jurisdictionCode: z.string().optional(),
  }),
});

export const RefreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export type LoginInput = z.infer<typeof LoginSchema>['body'];
export type RegisterInput = z.infer<typeof RegisterSchema>['body'];
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>['body'];
