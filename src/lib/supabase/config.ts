import { z } from 'zod';

import { env } from '@/lib/env';

const supabaseConfigSchema = z.object({
  url: z.string().url('EXPO_PUBLIC_SUPABASE_URL must be a valid URL.'),
  anonKey: z.string().min(1, 'EXPO_PUBLIC_SUPABASE_ANON_KEY is required.'),
});

export type SupabaseConfig = z.infer<typeof supabaseConfigSchema>;

export const hasSupabaseConfig = Boolean(env.supabaseUrl && env.supabaseAnonKey);

export function getSupabaseConfig(): SupabaseConfig {
  return supabaseConfigSchema.parse({
    url: env.supabaseUrl,
    anonKey: env.supabaseAnonKey,
  });
}
