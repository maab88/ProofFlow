-- ProofFlow MVP schema
-- Narrow scope only: finished job -> proof captured -> invoice sent -> payment requested.

create extension if not exists pgcrypto;

create type public.job_status as enum (
  'draft',
  'in_progress',
  'proof_captured',
  'invoice_ready',
  'invoice_sent',
  'payment_requested',
  'paid'
);

create type public.photo_category as enum (
  'before',
  'after'
);

create type public.invoice_payment_status as enum (
  'draft',
  'sent',
  'payment_requested',
  'paid',
  'overdue'
);

create type public.invoice_line_item_type as enum (
  'labor',
  'part'
);

create type public.message_type as enum (
  'invoice_email',
  'payment_request_email',
  'payment_request_sms'
);

create type public.message_delivery_status as enum (
  'queued',
  'sent',
  'delivered',
  'failed'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid,
  legal_name text not null,
  display_name text not null,
  default_currency_code text not null default 'CAD' check (default_currency_code in ('CAD', 'USD')),
  time_zone text not null default 'America/Toronto',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.users (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  auth_user_id uuid not null unique,
  full_name text not null,
  email text not null,
  phone text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint users_email_check check (position('@' in email) > 1)
);

alter table public.businesses
  add constraint businesses_owner_user_id_fkey
  foreign key (owner_user_id)
  references public.users(id)
  on delete set null;

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  display_name text not null,
  email text,
  phone text,
  address_line_1 text,
  address_line_2 text,
  city text,
  region text,
  postal_code text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint customers_email_check check (email is null or position('@' in email) > 1)
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  created_by_user_id uuid not null references public.users(id) on delete restrict,
  title text not null,
  site_address_line_1 text,
  site_address_line_2 text,
  site_city text,
  site_region text,
  site_postal_code text,
  status public.job_status not null default 'draft',
  scheduled_for timestamptz,
  completed_at timestamptz,
  work_summary_draft text,
  work_summary_final text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.job_photos (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  category public.photo_category not null,
  storage_bucket text not null,
  storage_path text not null,
  file_name text not null,
  mime_type text,
  sort_order integer not null default 0,
  captured_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  constraint job_photos_storage_path_unique unique (storage_path),
  constraint job_photos_sort_order_check check (sort_order >= 0)
);

create table public.voice_notes (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null unique references public.jobs(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  storage_bucket text not null,
  storage_path text not null unique,
  duration_seconds integer,
  transcript_draft text,
  transcript_final text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint voice_notes_duration_check check (duration_seconds is null or duration_seconds >= 0)
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null unique references public.jobs(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  invoice_number text not null,
  payment_status public.invoice_payment_status not null default 'draft',
  subtotal_cents integer not null default 0,
  tax_cents integer not null default 0,
  total_cents integer not null default 0,
  currency_code text not null default 'CAD' check (currency_code in ('CAD', 'USD')),
  payment_link_url text,
  pdf_storage_bucket text,
  pdf_storage_path text,
  sent_at timestamptz,
  paid_at timestamptz,
  due_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint invoices_totals_check check (
    subtotal_cents >= 0
    and tax_cents >= 0
    and total_cents >= 0
    and total_cents = subtotal_cents + tax_cents
  ),
  constraint invoices_invoice_number_business_unique unique (business_id, invoice_number),
  constraint invoices_pdf_path_pair_check check (
    (pdf_storage_bucket is null and pdf_storage_path is null)
    or (pdf_storage_bucket is not null and pdf_storage_path is not null)
  )
);

create table public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  line_type public.invoice_line_item_type not null,
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit_amount_cents integer not null,
  total_amount_cents integer not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint invoice_line_items_quantity_check check (quantity > 0),
  constraint invoice_line_items_amounts_check check (unit_amount_cents >= 0 and total_amount_cents >= 0),
  constraint invoice_line_items_sort_order_check check (sort_order >= 0)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  type public.message_type not null,
  delivery_status public.message_delivery_status not null default 'queued',
  recipient text not null,
  subject text,
  body text,
  provider_message_id text,
  sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index customers_business_id_idx on public.customers (business_id);
create index customers_business_display_name_idx on public.customers (business_id, display_name);
create index jobs_business_id_idx on public.jobs (business_id);
create index jobs_customer_id_idx on public.jobs (customer_id);
create index jobs_business_status_idx on public.jobs (business_id, status);
create index job_photos_job_category_idx on public.job_photos (job_id, category, sort_order);
create index voice_notes_business_id_idx on public.voice_notes (business_id);
create index invoices_business_payment_status_idx on public.invoices (business_id, payment_status);
create index invoices_customer_id_idx on public.invoices (customer_id);
create index invoice_line_items_invoice_sort_idx on public.invoice_line_items (invoice_id, sort_order);
create index messages_invoice_delivery_status_idx on public.messages (invoice_id, delivery_status);
create index messages_customer_id_idx on public.messages (customer_id);

create trigger set_businesses_updated_at before update on public.businesses for each row execute function public.set_updated_at();
create trigger set_users_updated_at before update on public.users for each row execute function public.set_updated_at();
create trigger set_customers_updated_at before update on public.customers for each row execute function public.set_updated_at();
create trigger set_jobs_updated_at before update on public.jobs for each row execute function public.set_updated_at();
create trigger set_voice_notes_updated_at before update on public.voice_notes for each row execute function public.set_updated_at();
create trigger set_invoices_updated_at before update on public.invoices for each row execute function public.set_updated_at();
create trigger set_invoice_line_items_updated_at before update on public.invoice_line_items for each row execute function public.set_updated_at();
create trigger set_messages_updated_at before update on public.messages for each row execute function public.set_updated_at();
