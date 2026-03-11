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
  services/
  store/
  theme/
  utils/
```

## Local setup

1. Install Node.js `20.18+`.
2. Copy `.env.example` to `.env`.
3. Install dependencies with `npm install`.
4. Start the dev server with `npm run start`.

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

Typed access lives in [`src/lib/env.ts`](./src/lib/env.ts).

## Included foundation

- Expo Router app shell using `src/app`
- Premium dark theme tokens
- App-level providers for safe areas, gestures, and TanStack Query
- Reusable UI primitives for screens, cards, buttons, form fields, empty states, loading states, and badges
- Placeholder screens for splash, auth, dashboard, customers, jobs, and settings

## Notes

- No backend, auth, CRUD, media capture, or invoice logic is implemented yet.
- The app is intentionally scoped as a polished foundation, not a full product workflow.
