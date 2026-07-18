# likyoyo — Link-in-bio Builder

A multi-admin **link-in-bio** builder (Linktree-style) built with Next.js 16, React 19,
Tailwind CSS v4 and Supabase. It lets admins design a mobile-first public profile page
(header, links, buttons, social icons, text, wallpaper), publish it under a namespaced
public URL, and collect support-form submissions that fan out to Supabase, Telegram, and
Google Sheets.

## Features

- **Visual builder** — live mobile preview, drag-and-drop link ordering (`@dnd-kit`),
  theming and wallpaper controls, backed by a `zustand` store with `localStorage` persistence.
- **Multi-admin public namespaces** — legacy single-segment slugs (`/mh1`) plus nested
  per-admin pages (`/{adminUsername}/{pageSlug}`). Slugs share reserved/unsafe-segment
  validation.
- **Admin panel** (`/admin`) — editor, saved-pages manager, analytics summary, data tools,
  and an owner control surface (`/admin/owner`) for enabling/disabling admins and managing a
  trash/restore flow for deleted public pages.
- **Feature-flagged labs** (`/admin/lab`) — opt-in experiments (Admin UI V2, Button/Menu
  System V2, Form Engine V1, responsive V2) gated by `NEXT_PUBLIC_*` flags.
- **Support forms** — deposit/withdraw issue forms and a generic form engine whose
  submissions are delivered through pluggable adapters (Supabase store, Google Sheets,
  Telegram admin notifications).
- **i18n** — Thai and English locales (`src/i18n`) kept at key parity.

## Tech stack

| Area        | Choice                                             |
| ----------- | -------------------------------------------------- |
| Framework   | Next.js 16 (App Router) + React 19                 |
| Styling     | Tailwind CSS v4, shadcn/ui, `@base-ui/react`       |
| State       | `zustand` (+ persist middleware)                   |
| Forms       | `react-hook-form` + `zod`                          |
| Backend     | Supabase (Postgres + Storage)                      |
| Integrations| Google Sheets, Telegram Bot API                    |

## Getting started

### Prerequisites

- Node.js 20+
- A Supabase project (URL, anon key, service-role key)

### Install & run

```bash
npm install
cp .env.example .env.local          # then fill in the values below
npm run dev                         # http://localhost:3000
```

> The public homepage is at `/`; the admin panel is at `/admin` (log in at `/admin/login`).

### Scripts

| Script          | Description                                                    |
| --------------- | ------------------------------------------------------------- |
| `npm run dev`   | Dev server on **webpack** (`next dev --webpack`) for local stability |
| `npm run build` | Production build via `scripts/next-build.mjs` (forces `NODE_ENV=production`) |
| `npm run start` | Serve the production build                                     |
| `npm run lint`  | ESLint (flat config, `eslint-config-next`)                     |

To hash a new admin password for seeding, use `node scripts/hash-admin-password.mjs`.

## Environment variables

Env files are git-ignored (`.env*`). Create `.env.local` for development.

### Required (Supabase)

| Variable                        | Purpose                                          |
| ------------------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL (must be `https`)           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key                       |
| `SUPABASE_SERVICE_ROLE_KEY`     | Service-role key for server-side data access     |
| `LINKBIO_IMAGES_BUCKET`         | Supabase Storage bucket for builder/admin images |

Server env is validated in `src/lib/server/env-validation.ts`; missing/placeholder values
fail the build fast.

### Admin auth

| Variable                | Purpose                                  |
| ----------------------- | ---------------------------------------- |
| `ADMIN_SESSION_SECRET`  | Secret used to sign admin session cookies |

### Support forms / uploads (optional)

| Variable                             | Purpose                                              |
| ------------------------------------ | ---------------------------------------------------- |
| `SUPPORT_UPLOADS_BUCKET`             | Supabase Storage bucket for support slip uploads     |
| `SUPPORT_SUBMISSION_ADAPTER_MODE`    | `auto` \| `supabase` \| `sheets` (default `auto`)    |
| `GENERIC_FORM_SUBMISSION_ADAPTER_MODE` | Same modes for the generic form engine             |

### Google Sheets integration (optional)

| Variable                              | Purpose                                        |
| ------------------------------------- | ---------------------------------------------- |
| `GOOGLE_SHEETS_SUPPORT_SPREADSHEET_ID`| Target spreadsheet ID                          |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`        | Service account email                          |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`  | Service account private key                    |
| `GOOGLE_SHEETS_SUPPORT_DEPOSIT_TAB`   | Deposit tab name (default `ฝากเงินไม่เข้า`)     |
| `GOOGLE_SHEETS_SUPPORT_WITHDRAW_TAB`  | Withdraw tab name (default `ถอนเงินไม่ได้`)     |
| `GOOGLE_SHEETS_GENERIC_FORMS_TAB`     | Generic forms tab name (default `Generic Forms`) |

### Telegram notifications (optional)

| Variable                 | Purpose                          |
| ------------------------ | -------------------------------- |
| `TELEGRAM_BOT_TOKEN`     | Bot token for admin notifications |
| `TELEGRAM_ADMIN_CHAT_ID` | Chat ID that receives alerts      |

### Feature flags (all `NEXT_PUBLIC_*`, boolean: `1/true/yes/on`)

See `src/lib/feature-flags.ts` for the full list, including:
`NEXT_PUBLIC_ENABLE_ADMIN_UI_V2`, `NEXT_PUBLIC_ENABLE_UI_LAB_MODE`,
`NEXT_PUBLIC_ADMIN_SAFE_MODE`, `NEXT_PUBLIC_DISABLE_ADMIN_LIVE_PREVIEW`,
`NEXT_PUBLIC_ENABLE_BUTTON_MENU_V2_{ADMIN,PREVIEW,PUBLIC}`,
`NEXT_PUBLIC_ENABLE_FORM_ENGINE_V1`, `NEXT_PUBLIC_ENABLE_PUBLIC_RESPONSIVE_V2`.

## Project structure

```
src/
  app/                 App Router: public pages, /admin, and /api route handlers
    [username]/        Legacy + nested public profile routes
    admin/             Admin panel, login, owner control, labs
    api/               Route handlers (admin, public-pages, support, forms)
  components/          UI (shadcn), admin, preview, public, shared
  features/builder/    Builder types, schema (zod), store, utils, mock data
  i18n/                th/en locales + hook
  lib/
    server/            Supabase-backed stores, adapters, env validation, admin auth
    local-storage/     Client persistence (profile, images, analytics, language)
    public-pages/      Public path helpers + client fetch layer
    supabase/          Supabase client + env helpers
supabase/migrations/   SQL migrations (owner control, deleted-pages archive)
docs/                  Design/handoff notes (see docs/AI_HANDOFF.md)
data/                  Dev-only JSON fallbacks for local development
```

## Data layer

The app resolves data from three sources depending on context:

1. **Supabase** — the source of truth for public pages, admin users, and submissions in
   production (`src/lib/server/*`).
2. **Dev JSON** — `data/*.dev.json` provides local fallbacks so the app runs without a live
   Supabase connection during development.
3. **localStorage** — client-side persistence for the in-progress builder draft and UI prefs.

## Local Windows dev notes

- `npm run dev` intentionally uses **webpack** (`next dev --webpack`) for local stability.
- Adding a Microsoft Defender / antivirus exclusion for this folder can improve dev perf.
- Run only one dev server at a time; if `http://localhost:3000` already responds, don't start
  another. To stop a stuck server on Windows: `taskkill /PID <PID> /F`.
- Turbopack trace (diagnostics only): `npx next dev --turbo --experimental-upload-trace <otlp-endpoint>`.

## Deployment

Optimized for Vercel. Configure the environment variables above in your hosting provider,
run `npm run build`, then `npm run start` (or deploy via the Vercel platform).
