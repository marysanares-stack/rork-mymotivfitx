## Quick orientation for code-generating agents

This repo is an Expo Router + React Native app scaffolded by Rork. Use this file to get productive quickly: run, where to make changes, important conventions, and integration points.

1) Big picture
- Frontend: `app/` — file-based routing (Expo Router). Tabs live under `app/(tabs)/` and the root layout is `app/_layout.tsx`.
- State & providers: `contexts/` — e.g. `FitnessContext.tsx`, `SocialContext.tsx`, `GroupsContext.tsx`. These are composed in `app/_layout.tsx`.
- API (local/backend): `backend/` — Hono server (`backend/hono.ts`) with a tRPC router at `backend/trpc/app-router.ts`. Client side tRPC wiring is in `lib/trpc.ts` and expects the backend router type `AppRouter`.

2) How to run locally (developer commands)
- Package manager: Bun is used in README and `package.json` scripts. Install deps with `bun i`.
- Start (native + tunnel): `bun run start` — the `start` script uses `bunx rork start -p <project-id> --tunnel`.
- Web preview: `bun run start-web` (or `bun run start-web-dev` for debug logs).
- Note: `postinstall` sets `@rork` registry and expects `RORK_AUTH_TOKEN` in CI/dev environment.

3) Important envs & runtime checks
- EXPO_PUBLIC_RORK_API_BASE_URL — required by `lib/trpc.ts`. If missing the app throws. Define it in `app.json` under `expo.extra` or export in shell env when running.
- RORK_AUTH_TOKEN — used in `postinstall` to access `@rork` scoped packages.

4) Project-specific conventions and patterns
- File-based routing: pages/screens are added under `app/`. Dynamic routes follow Expo Router patterns, e.g. `app/group-detail/[id].tsx`.
- Providers are grouped in `app/_layout.tsx` and compose many contexts in a specific order. When adding a new provider, import and wrap it in the same layout for app-wide access.
- Local persistence: `AsyncStorage` keys are centralized inside contexts (see `FitnessContext.tsx` STORAGE_KEYS). Reuse or extend these keys rather than inventing global keys.
- tRPC usage: Client uses `createTRPCReact<AppRouter>()` in `lib/trpc.ts`. Keep backend router shape (`backend/trpc/app-router.ts`) and client type in sync; server routes live under `backend/trpc/routes/*` (see example route `routes/example/hi/route`).
- Data serialization: tRPC uses `superjson` transformer — maintain serializable types accordingly.
- TestIDs and accessibility: UI components include `testID` attributes (e.g., `MusicQuickLaunch`), follow the same pattern for new components to support automated tests.

5) Integration points to watch
- Backend endpoint: client expects `${EXPO_PUBLIC_RORK_API_BASE_URL}/api/trpc`. If you change the API path, update both `lib/trpc.ts` and the Hono router mapping in `backend/hono.ts`.
- Notifications & platform differences: `FitnessContext.tsx` branches behavior for `Platform.OS === 'web'` vs native (notifications, scheduling). Keep web vs native guardrails when touching those features.

6) Examples to reference when making edits
- Add a new screen: mirror patterns in `app/(tabs)/activity.tsx` and register navigation via file placement.
- Add a backend tRPC route: add handler under `backend/trpc/routes/...` and export it via `backend/trpc/app-router.ts`.
- Persisting local state: look at `contexts/FitnessContext.tsx` for AsyncStorage patterns and storages keys.

7) What to avoid / common pitfalls
- Don't assume a running local API — the app may rely on a remote Rork API. If you need to run a local backend, confirm how it's started in your environment (there's no dedicated `npm` script for the Hono server in `package.json`).
- Don't remove the `EXPO_PUBLIC_RORK_API_BASE_URL` check in `lib/trpc.ts` — it's an intentional guard that surfaces misconfiguration early.

8) Where to update docs or CI
- Update this file when adding new global providers, persistent storage keys, or changing the tRPC endpoint.

If anything above is unclear or incomplete (e.g., how you prefer local backend startup or CI secrets), tell me which part to expand and I will iterate.
