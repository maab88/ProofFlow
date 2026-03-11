import type { PostgrestError } from '@supabase/supabase-js';

import type { Customer } from '@/lib/domain/models';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

export type CustomerRecord = Customer;

export type CustomerUpsertInput = {
  businessId: string;
  displayName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
};

type CustomerRow = Database['public']['Tables']['customers']['Row'];

function mapCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    businessId: row.business_id,
    displayName: row.display_name,
    email: row.email,
    phone: row.phone,
    addressLine1: row.address_line_1,
    addressLine2: row.address_line_2,
    city: row.city,
    region: row.region,
    postalCode: row.postal_code,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getCustomerErrorMessage(error: PostgrestError | Error | null | undefined) {
  if (!error) {
    return 'Something went wrong. Please try again.';
  }

  const message = error.message.toLowerCase();

  if (message.includes('violates foreign key constraint')) {
    return 'This customer still has linked jobs, so it cannot be deleted yet.';
  }

  if (message.includes('network')) {
    return 'Your connection was interrupted. Please try again.';
  }

  return error.message;
}

export async function listCustomers(businessId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('business_id', businessId)
    .order('display_name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapCustomer(row as CustomerRow));
}

export async function getCustomer(customerId: string, businessId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .eq('business_id', businessId)
    .single();

  if (error) {
    throw error;
  }

  return mapCustomer(data as CustomerRow);
}

export async function createCustomer(input: CustomerUpsertInput) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('customers')
    .insert({
      business_id: input.businessId,
      display_name: input.displayName,
      phone: input.phone,
      email: input.email,
      address_line_1: input.address,
      notes: input.notes,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapCustomer(data as CustomerRow);
}

export async function updateCustomer(customerId: string, input: CustomerUpsertInput) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('customers')
    .update({
      display_name: input.displayName,
      phone: input.phone,
      email: input.email,
      address_line_1: input.address,
      notes: input.notes,
    })
    .eq('id', customerId)
    .eq('business_id', input.businessId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapCustomer(data as CustomerRow);
}

export async function deleteCustomer(customerId: string, businessId: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('customers').delete().eq('id', customerId).eq('business_id', businessId);

  if (error) {
    throw error;
  }
}
