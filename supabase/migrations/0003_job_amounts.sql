alter table public.jobs
  add column if not exists labor_amount_cents integer not null default 0,
  add column if not exists parts_amount_cents integer not null default 0,
  add column if not exists tax_amount_cents integer not null default 0,
  add column if not exists total_amount_cents integer not null default 0;

alter table public.jobs
  drop constraint if exists jobs_labor_amount_cents_check,
  drop constraint if exists jobs_parts_amount_cents_check,
  drop constraint if exists jobs_tax_amount_cents_check,
  drop constraint if exists jobs_total_amount_cents_check,
  drop constraint if exists jobs_total_matches_amounts_check;

alter table public.jobs
  add constraint jobs_labor_amount_cents_check check (labor_amount_cents >= 0),
  add constraint jobs_parts_amount_cents_check check (parts_amount_cents >= 0),
  add constraint jobs_tax_amount_cents_check check (tax_amount_cents >= 0),
  add constraint jobs_total_amount_cents_check check (total_amount_cents >= 0),
  add constraint jobs_total_matches_amounts_check check (
    total_amount_cents = labor_amount_cents + parts_amount_cents + tax_amount_cents
  );

create index if not exists jobs_status_idx on public.jobs(status);
create index if not exists jobs_completed_at_idx on public.jobs(completed_at desc);
