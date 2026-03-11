alter table public.businesses
  add column if not exists logo_storage_path text,
  add column if not exists default_hourly_rate_cents integer,
  add column if not exists tax_label text,
  add column if not exists tax_rate_basis_points integer,
  add column if not exists onboarding_completed_at timestamptz;

alter table public.businesses
  add constraint businesses_default_hourly_rate_cents_check
  check (default_hourly_rate_cents is null or default_hourly_rate_cents >= 0);

alter table public.businesses
  add constraint businesses_tax_rate_basis_points_check
  check (tax_rate_basis_points is null or (tax_rate_basis_points >= 0 and tax_rate_basis_points <= 10000));
