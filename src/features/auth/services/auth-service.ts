import type { AuthError, User as AuthUser } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

import type { Business, User } from '@/lib/domain/models';
import { env } from '@/lib/env';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

export type AuthSnapshot = {
  appUser: User | null;
  business: Business | null;
  isOnboarded: boolean;
};

export type SignInParams = {
  email: string;
  password: string;
};

export type SignUpParams = {
  fullName: string;
  email: string;
  password: string;
};

export type BusinessSetupParams = {
  businessName: string;
  logoStoragePath?: string | null;
  defaultHourlyRateCents: number;
  taxLabel: string;
  taxRateBasisPoints: number;
};

type UserRow = Database['public']['Tables']['users']['Row'];
type BusinessRow = Database['public']['Tables']['businesses']['Row'];

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    businessId: row.business_id,
    authUserId: row.auth_user_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapBusiness(row: BusinessRow): Business {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    legalName: row.legal_name,
    displayName: row.display_name,
    defaultCurrencyCode: row.default_currency_code,
    timeZone: row.time_zone,
    logoStoragePath: row.logo_storage_path,
    defaultHourlyRateCents: row.default_hourly_rate_cents,
    taxLabel: row.tax_label,
    taxRateBasisPoints: row.tax_rate_basis_points,
    onboardingCompletedAt: row.onboarding_completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getAuthDisplayName(user: AuthUser) {
  const metadataName = typeof user.user_metadata.full_name === 'string' ? user.user_metadata.full_name.trim() : '';

  if (metadataName.length > 0) {
    return metadataName;
  }

  if (user.email) {
    return user.email.split('@')[0];
  }

  return 'ProofFlow Owner';
}

export async function signInWithPassword({ email, password }: SignInParams) {
  const supabase = getSupabaseClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithPassword({ fullName, email, password }: SignUpParams) {
  const supabase = getSupabaseClient();
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
}

export async function sendPasswordResetEmail(email: string) {
  const supabase = getSupabaseClient();

  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: Linking.createURL('/sign-in', { scheme: env.appScheme }),
  });
}

export async function signOut() {
  const supabase = getSupabaseClient();
  return supabase.auth.signOut();
}

export async function getCurrentSession() {
  const supabase = getSupabaseClient();
  return supabase.auth.getSession();
}

export async function getAuthSnapshot(authUserId: string): Promise<AuthSnapshot> {
  const supabase = getSupabaseClient();

  const { data, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  const userRow = (data ?? null) as UserRow | null;

  if (userError) {
    throw userError;
  }

  if (!userRow) {
    return {
      appUser: null,
      business: null,
      isOnboarded: false,
    };
  }

  const { data: businessData, error: businessError } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', userRow.business_id)
    .single();

  const businessRow = businessData as BusinessRow;

  if (businessError) {
    throw businessError;
  }

  const business = mapBusiness(businessRow);

  return {
    appUser: mapUser(userRow),
    business,
    isOnboarded: Boolean(business.onboardingCompletedAt),
  };
}

export async function completeBusinessSetup(authUser: AuthUser, values: BusinessSetupParams) {
  const supabase = getSupabaseClient();
  const snapshot = await getAuthSnapshot(authUser.id);
  const now = new Date().toISOString();

  const businessPayload = {
    legal_name: values.businessName,
    display_name: values.businessName,
    logo_storage_path: values.logoStoragePath?.trim() ? values.logoStoragePath.trim() : null,
    default_hourly_rate_cents: values.defaultHourlyRateCents,
    tax_label: values.taxLabel,
    tax_rate_basis_points: values.taxRateBasisPoints,
    onboarding_completed_at: now,
  };

  if (snapshot.appUser && snapshot.business) {
    const { error: businessError } = await supabase
      .from('businesses')
      .update(businessPayload)
      .eq('id', snapshot.business.id);

    if (businessError) {
      throw businessError;
    }

    const displayName = getAuthDisplayName(authUser);
    const { error: userError } = await supabase
      .from('users')
      .update({
        full_name: displayName,
        email: authUser.email ?? snapshot.appUser.email,
      })
      .eq('id', snapshot.appUser.id);

    if (userError) {
      throw userError;
    }

    return getAuthSnapshot(authUser.id);
  }

  const { data: insertedBusiness, error: businessInsertError } = await supabase
    .from('businesses')
    .insert(businessPayload)
    .select('*')
    .single();

  const businessRow = insertedBusiness as BusinessRow;

  if (businessInsertError) {
    throw businessInsertError;
  }

  const { data: insertedUser, error: userInsertError } = await supabase
    .from('users')
    .insert({
      business_id: businessRow.id,
      auth_user_id: authUser.id,
      full_name: getAuthDisplayName(authUser),
      email: authUser.email ?? 'unknown@proofflow.local',
      phone: authUser.phone ?? null,
    })
    .select('*')
    .single();

  const userRow = insertedUser as UserRow;

  if (userInsertError) {
    await supabase.from('businesses').delete().eq('id', businessRow.id);
    throw userInsertError;
  }

  const { error: businessOwnerError } = await supabase
    .from('businesses')
    .update({ owner_user_id: userRow.id })
    .eq('id', businessRow.id);

  if (businessOwnerError) {
    throw businessOwnerError;
  }

  return getAuthSnapshot(authUser.id);
}

export function getAuthErrorMessage(error: AuthError | Error | null | undefined) {
  if (!error) {
    return 'Something went wrong. Please try again.';
  }

  const message = error.message.toLowerCase();

  if (message.includes('invalid login credentials')) {
    return 'The email or password did not match. Please try again.';
  }

  if (message.includes('email not confirmed')) {
    return 'Check your inbox and confirm your email before signing in.';
  }

  if (message.includes('user already registered')) {
    return 'An account already exists for that email. Try signing in instead.';
  }

  return error.message;
}
