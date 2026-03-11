# ProofFlow

ProofFlow is a premium, mobile-first closeout app foundation for solo tradespeople. This scaffold focuses on the narrow path from completed work to documented proof to invoice and payment request, with a polished dark shell and maintainable feature-based architecture.

## Stack

- Expo + React Native + TypeScript
- Expo Router
- NativeWind
- Zustand
- TanStack Query
- React Hook Form
- Zod
- Supabase

## Project structure

```text
src/
  app/
  components/
    providers/
    ui/
  features/
    auth/
    onboarding/
    dashboard/
    customers/
    jobs/
    closeout/
    invoices/
    settings/
  lib/
    domain/
    supabase/
  services/
  store/
  theme/
  utils/
supabase/
  migrations/
docs/
```

## Local setup

1. Install Node.js `20.18+`.
2. Copy `.env.example` to `.env`.
3. Fill in:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
4. Install dependencies with `npm install`.
5. Start the dev server with `npm run start`.

## Run targets

- `npm run android`
- `npm run ios`
- `npm run web`
- `npm run typecheck`

## Environment variables

The scaffold currently uses public Expo environment variables:

- `EXPO_PUBLIC_APP_NAME`
- `EXPO_PUBLIC_APP_ENV`
- `EXPO_PUBLIC_APP_SCHEME`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Typed access lives in [`src/lib/env.ts`](./src/lib/env.ts).
Supabase config is validated lazily when the client is requested.

## Supabase foundation

- Typed Supabase client: [`src/lib/supabase/client.ts`](./src/lib/supabase/client.ts)
- Supabase config helper: [`src/lib/supabase/config.ts`](./src/lib/supabase/config.ts)
- Database types: [`src/lib/supabase/database.types.ts`](./src/lib/supabase/database.types.ts)
- Domain models: [`src/lib/domain/models.ts`](./src/lib/domain/models.ts)
- Storage path helpers: [`src/lib/domain/storage-paths.ts`](./src/lib/domain/storage-paths.ts)
- Initial schema migration: [`supabase/migrations/0001_init_schema.sql`](./supabase/migrations/0001_init_schema.sql)
- Setup guide: [`docs/supabase-setup.md`](./docs/supabase-setup.md)

## Notes

- No auth flow, CRUD logic, uploads, Stripe, or message delivery logic is implemented yet.
- The schema is intentionally narrow around closeout, invoicing, and payment request flow.
