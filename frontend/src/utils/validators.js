import { z } from 'zod';

const pwd = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'One uppercase letter')
  .regex(/[a-z]/, 'One lowercase letter')
  .regex(/[0-9]/, 'One number')
  .regex(/[@$!%*?&]/, 'One special character (@$!%*?&)');

export const registerSchema = z.object({
  firstName:       z.string().min(2, 'Min 2 chars').max(50),
  lastName:        z.string().min(2, 'Min 2 chars').max(50),
  email:           z.string().email('Invalid email'),
  password:        pwd,
  confirmPassword: z.string(),
  phone:           z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export const loginSchema = z.object({
  email:      z.string().email('Invalid email'),
  password:   z.string().min(1, 'Required'),
  rememberMe: z.boolean().optional(),
});

export const forgotSchema  = z.object({ email: z.string().email('Invalid email') });

export const resetSchema   = z.object({
  password:        pwd,
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export const changePwSchema = z.object({
  currentPassword:    z.string().min(1, 'Required'),
  newPassword:        pwd,
  confirmNewPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmNewPassword, { message: 'Do not match', path: ['confirmNewPassword'] });

export const getPasswordStrength = (password = '') => {
  let score = 0;
  if (password.length >= 8)      score++;
  if (password.length >= 12)     score++;
  if (/[A-Z]/.test(password))    score++;
  if (/[a-z]/.test(password))    score++;
  if (/[0-9]/.test(password))    score++;
  if (/[@$!%*?&]/.test(password))score++;
  const pct = Math.round((score / 6) * 100);
  const color = score <= 2 ? '#ef4444' : score <= 4 ? '#f59e0b' : '#22c55e';
  const label = score <= 2 ? 'Weak' : score <= 4 ? 'Fair' : score <= 5 ? 'Strong' : 'Very strong';
  return { score, pct, color, label };
};