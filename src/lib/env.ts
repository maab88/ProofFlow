import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_APP_NAME: z.string().default('ProofFlow'),
  EXPO_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  EXPO_PUBLIC_APP_SCHEME: z.string().default('proofflow'),
  EXPO_PUBLIC_SUPABASE_URL: z.string().optional(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
});

const parsedEnv = envSchema.parse({
  EXPO_PUBLIC_APP_NAME: process.env.EXPO_PUBLIC_APP_NAME,
  EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
  EXPO_PUBLIC_APP_SCHEME: process.env.EXPO_PUBLIC_APP_SCHEME,
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
});

export const env = {
  appName: parsedEnv.EXPO_PUBLIC_APP_NAME,
  appEnv: parsedEnv.EXPO_PUBLIC_APP_ENV,
  appScheme: parsedEnv.EXPO_PUBLIC_APP_SCHEME,
  supabaseUrl: parsedEnv.EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: parsedEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY,
} as const;
