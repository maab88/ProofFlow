# Supabase Setup

This project uses a narrow Supabase schema for the ProofFlow MVP:

`finished job -> proof captured -> invoice sent -> payment requested`

## 1. Create the Supabase project

1. Create a new Supabase project.
2. Copy the project URL and anon key.
3. Add them to `.env` using the names below:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## 2. App behavior before Supabase is configured

The app can still boot without Supabase credentials while you are working on UI-only tasks.
The typed Supabase client now validates credentials only when `getSupabaseClient()` is actually called.

## 3. Apply the schema

Option A: Supabase SQL Editor

1. Open the SQL editor in Supabase.
2. Paste the contents of [supabase/migrations/0001_init_schema.sql](../supabase/migrations/0001_init_schema.sql).
3. Run the script once.

Option B: Supabase CLI

1. Install the Supabase CLI.
2. Run `supabase link --project-ref <your-project-ref>`.
3. Run `supabase db push` from the project root.

Apply every migration in `supabase/migrations`, not only the initial schema. The later migrations add onboarding fields, job amount fields, and storage access policies needed for closeout photo uploads.

## 4. Recommended storage buckets

Create these buckets in Supabase Storage:

- `job-media`
- `generated-files`

Recommended path conventions are defined in [src/lib/domain/storage-paths.ts](../src/lib/domain/storage-paths.ts).

Examples:

- `business-id/jobs/job-id/photos/photo-id.jpg`
- `business-id/jobs/job-id/voice-notes/voice-note-id.m4a`
- `business-id/invoices/invoice-id/invoice.pdf`

The `job-media` bucket also needs the storage policies from the later SQL migrations so authenticated users can upload and read files inside their own business path.

## 5. Money approach

Money is stored as integer cents in Postgres:

- `subtotal_cents`
- `tax_cents`
- `total_cents`
- `unit_amount_cents`
- `total_amount_cents`

This avoids floating-point errors.

Quantities use `numeric(10,2)` so labor hours or part quantities can support values like `1.50` safely.

## 6. Recommended first sanity inserts

1. Insert one `businesses` row.
2. Insert one `users` row tied to that business.
3. Update that business row to set `owner_user_id`.
4. Insert one `customers` row.
5. Insert one `jobs` row.
6. Insert one `job_photos` row and one `voice_notes` row.
7. Insert one `invoices` row and one `invoice_line_items` row.
8. Insert one `messages` row tied to the invoice.

## 7. Suggested handover improvements adopted here

- explicit enums for closeout lifecycle states
- explicit enum for invoice line item type
- integer-cent money columns instead of float/decimal money amounts
- one-to-one invoice-per-job for the MVP
- one voice note per job for the MVP
- storage path uniqueness for uploaded/generated files
- narrow indexes for customer lookup, closeout status, invoice status, and message tracking
- `created_at` / `updated_at` consistency with update triggers
