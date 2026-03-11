import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_APP_NAME: z.string().default('ProofFlow'),
  EXPO_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  EXPO_PUBLIC_APP_SCHEME: z.string().default('proofflow'),
});

const parsedEnv = envSchema.parse({
  EXPO_PUBLIC_APP_NAME: process.env.EXPO_PUBLIC_APP_NAME,
  EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
  EXPO_PUBLIC_APP_SCHEME: process.env.EXPO_PUBLIC_APP_SCHEME,
});

export const env = {
  appName: parsedEnv.EXPO_PUBLIC_APP_NAME,
  appEnv: parsedEnv.EXPO_PUBLIC_APP_ENV,
  appScheme: parsedEnv.EXPO_PUBLIC_APP_SCHEME,
} as const;
