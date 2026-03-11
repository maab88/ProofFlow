import type { PostgrestError } from '@supabase/supabase-js';

import type { Job } from '@/lib/domain/models';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

export type JobListRecord = Job & {
  customerName: string;
};

export type JobUpsertInput = {
  businessId: string;
  createdByUserId: string;
  customerId: string;
  title: string;
  status: Database['public']['Enums']['job_status'];
  completedAt: string | null;
  workSummary: string | null;
  laborAmountCents: number;
  partsAmountCents: number;
  taxAmountCents: number;
  totalAmountCents: number;
};

type JobRow = Database['public']['Tables']['jobs']['Row'];
type CustomerRelation = { display_name: string } | { display_name: string }[] | null;
type JobWithCustomerRow = JobRow & { customers: CustomerRelation };

function mapJob(row: JobRow): Job {
  return {
    id: row.id,
    businessId: row.business_id,
    customerId: row.customer_id,
    createdByUserId: row.created_by_user_id,
    title: row.title,
    siteAddressLine1: row.site_address_line_1,
    siteAddressLine2: row.site_address_line_2,
    siteCity: row.site_city,
    siteRegion: row.site_region,
    sitePostalCode: row.site_postal_code,
    status: row.status,
    scheduledFor: row.scheduled_for,
    completedAt: row.completed_at,
    workSummaryDraft: row.work_summary_draft,
    workSummaryFinal: row.work_summary_final,
    laborAmountCents: row.labor_amount_cents,
    partsAmountCents: row.parts_amount_cents,
    taxAmountCents: row.tax_amount_cents,
    totalAmountCents: row.total_amount_cents,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getCustomerName(relation: CustomerRelation) {
  if (!relation) {
    return 'Unknown customer';
  }

  if (Array.isArray(relation)) {
    return relation[0]?.display_name ?? 'Unknown customer';
  }

  return relation.display_name;
}

export function getJobErrorMessage(error: PostgrestError | Error | null | undefined) {
  if (!error) {
    return 'Something went wrong. Please try again.';
  }

  const message = error.message.toLowerCase();

  if (message.includes('violates foreign key constraint')) {
    return 'This job is still linked to closeout records, so it cannot be deleted yet.';
  }

  if (message.includes('network')) {
    return 'Your connection was interrupted. Please try again.';
  }

  return error.message;
}

export async function listJobs(businessId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('jobs')
    .select('*, customers(display_name)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => {
    const typedRow = row as JobWithCustomerRow;
    return {
      ...mapJob(typedRow),
      customerName: getCustomerName(typedRow.customers),
    };
  });
}

export async function getJob(jobId: string, businessId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('jobs')
    .select('*, customers(display_name)')
    .eq('id', jobId)
    .eq('business_id', businessId)
    .single();

  if (error) {
    throw error;
  }

  const typedRow = data as JobWithCustomerRow;

  return {
    ...mapJob(typedRow),
    customerName: getCustomerName(typedRow.customers),
  };
}

export async function createJob(input: JobUpsertInput) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('jobs')
    .insert({
      business_id: input.businessId,
      created_by_user_id: input.createdByUserId,
      customer_id: input.customerId,
      title: input.title,
      status: input.status,
      completed_at: input.completedAt,
      work_summary_draft: input.workSummary,
      labor_amount_cents: input.laborAmountCents,
      parts_amount_cents: input.partsAmountCents,
      tax_amount_cents: input.taxAmountCents,
      total_amount_cents: input.totalAmountCents,
    })
    .select('*, customers(display_name)')
    .single();

  if (error) {
    throw error;
  }

  const typedRow = data as JobWithCustomerRow;
  return {
    ...mapJob(typedRow),
    customerName: getCustomerName(typedRow.customers),
  };
}

export async function updateJob(jobId: string, input: JobUpsertInput) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('jobs')
    .update({
      customer_id: input.customerId,
      title: input.title,
      status: input.status,
      completed_at: input.completedAt,
      work_summary_draft: input.workSummary,
      labor_amount_cents: input.laborAmountCents,
      parts_amount_cents: input.partsAmountCents,
      tax_amount_cents: input.taxAmountCents,
      total_amount_cents: input.totalAmountCents,
    })
    .eq('id', jobId)
    .eq('business_id', input.businessId)
    .select('*, customers(display_name)')
    .single();

  if (error) {
    throw error;
  }

  const typedRow = data as JobWithCustomerRow;
  return {
    ...mapJob(typedRow),
    customerName: getCustomerName(typedRow.customers),
  };
}

export async function updateJobStatus(jobId: string, businessId: string, status: Database['public']['Enums']['job_status'], completedAt: string | null) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('jobs')
    .update({
      status,
      completed_at: completedAt,
    })
    .eq('id', jobId)
    .eq('business_id', businessId)
    .select('*, customers(display_name)')
    .single();

  if (error) {
    throw error;
  }

  const typedRow = data as JobWithCustomerRow;
  return {
    ...mapJob(typedRow),
    customerName: getCustomerName(typedRow.customers),
  };
}

export async function deleteJob(jobId: string, businessId: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('jobs').delete().eq('id', jobId).eq('business_id', businessId);

  if (error) {
    throw error;
  }
}
