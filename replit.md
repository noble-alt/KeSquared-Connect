# Ke²Connect

Campus transportation app for University of Ibadan — students book keke rides, drivers accept requests and track earnings.

## Run & Operate

- `pnpm --filter @workspace/ke2connect run dev` — run the Expo mobile app (via workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- Expo (SDK 54) + Expo Router (file-based routing)
- React Native + TypeScript
- AsyncStorage for all local persistence (no backend needed for MVP)
- React Context for auth and ride state
- expo-linear-gradient, expo-haptics, expo-location, @expo/vector-icons

## Where things live

- `artifacts/ke2connect/` — Expo mobile app
  - `app/auth/` — Welcome, Login, Register screens
  - `app/(tabs)/` — Student tab layout: Ride (map), History, Profile
  - `app/(driver-tabs)/` — Driver tab layout: Drive, Earnings, Trips, Profile
  - `contexts/AuthContext.tsx` — Auth state, login/register/logout with AsyncStorage
  - `contexts/RideContext.tsx` — Ride state, driver matching simulation, earnings
  - `constants/colors.ts` — Nigerian green + gold theme with full dark mode
  - `constants/locations.ts` — 14 preset UI campus locations + mock drivers

## Architecture decisions

- **Frontend-only MVP**: All data stored in AsyncStorage. No backend required for the first build.
- **Two-role navigation**: Students go to `/(tabs)`, drivers to `/(driver-tabs)`. `app/index.tsx` acts as auth gate.
- **Simulated real-time**: Driver matching uses `setTimeout` (3.5s delay), incoming requests use randomized timers (6-12s when driver is online).
- **Commission model**: Normal ride ₦200 → driver earns ₦180 (₦20 fee). Drop ride ₦500 → driver earns ₦450 (₦50 fee).
- **Campus-specific**: 14 preset University of Ibadan locations; UI region coordinates hardcoded as map center.

## Product

- **Students**: Select destination from campus locations, choose Normal (₦200, shared) or Drop (₦500, private) ride, see driver match with name/plate/rating, SOS emergency button
- **Drivers**: Online/offline toggle, simulated incoming requests with Accept/Reject, active trip management, earnings dashboard, trip history

## User preferences

- Nigerian green (#00A651) + gold (#FFB700) color theme
- Campus-specific for University of Ibadan
- Two ride types: Normal ₦200 (shared), Drop ₦500 (private)
- JWT-style auth stored in AsyncStorage

## Gotchas

- `expo-location` doesn't work on web — use `Platform.OS !== "web"` checks
- Web insets: 67px top, 84px tab bar height (set on tabBarStyle, not paddingBottom)
- `react-native-maps@1.18.0` (if added later) — do NOT add to `app.json` plugins
- UUID: use `Date.now().toString() + Math.random().toString(36).substr(2, 9)` not the `uuid` package
- Only restart the Expo workflow when changing dependencies or hitting Metro errors — HMR handles code changes

## Pointers

- See the `pnpm-workspace` skill for workspace structure
- See the `expo` skill for Expo-specific guidelines
