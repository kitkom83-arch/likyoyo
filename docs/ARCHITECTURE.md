# Architecture

High-level map of how `likyoyo` is put together. See `README.md` for setup and env vars.

## Rendering & routing (Next.js 16 App Router)

- **Public profile pages** — `src/app/[username]/page.tsx` (legacy single-segment slugs like
  `/mh1`) and `src/app/[username]/[pageSlug]/page.tsx` (nested per-admin pages like
  `/admin1/test-page-1`). Both are server components that resolve data server-side and hand a
  resolved profile to `PublicProfilePageClient`. `params` is an async `Promise` (Next 16
  convention) and is awaited before use.
- **Admin** — `src/app/admin/*`. `/admin` renders `AdminShell` (client). `/admin/login`,
  `/admin/owner`, and `/admin/lab` are separate route segments, so Next.js code-splits them
  automatically — they are **not** part of the main admin bundle.
- **API** — route handlers under `src/app/api/**`. They consistently: await async `params`,
  validate slugs (`isSafePublicPageSlug`) and bodies (`zod` schemas from
  `features/builder/schema.ts`), guard admin actions via
  `getAdminSessionFromRequest`, and return `NextResponse.json` with explicit status codes.

## State & persistence

- **Builder store** — `src/features/builder/store/use-builder-store.ts` is a `zustand` store
  with `persist` middleware writing the in-progress draft to `localStorage` behind an
  SSR-safe guard (`typeof window` checks + try/catch, plus a `linkbio-storage-warning` event
  on quota errors).
- **Client persistence helpers** — `src/lib/local-storage/*` (profile, images, analytics,
  language, safety settings).

## Data layer (source-of-truth precedence)

| Domain                | Production source        | Client/dev aid                          |
| --------------------- | ------------------------ | --------------------------------------- |
| Public pages          | **Supabase** (`public_pages`, `public_pages_deleted`) via `src/lib/server/public-pages-store.ts` | `localStorage` draft in the builder store |
| Admin users / auth    | **Supabase** via `src/lib/server/admin-users-store.ts` + `admin-auth.ts` | — |
| Support submissions   | **Supabase** or **Google Sheets** via `src/lib/server/support-submission-adapter.ts` | `data/support-submissions.dev.json` via `support-submissions-store.ts` |
| Generic form submissions | **Supabase** or **Google Sheets** via `generic-form-submission-adapter.ts` | `data/*.dev.json` via `generic-form-submissions-store.ts` |

- Server env is validated up front in `src/lib/server/env-validation.ts`; missing or
  placeholder Supabase values fail the build fast rather than silently degrading.
- The submission **adapters** pick their target from `*_SUBMISSION_ADAPTER_MODE`
  (`auto` | `supabase` | `sheets`); `auto` prefers Sheets/Supabase when configured and falls
  back to the local dev JSON store in development.

> Note: `data/public-pages.dev.json` is vestigial. Its only reader/writer
> (`dev-public-pages-store.ts`) was orphaned and has been removed; public pages resolve
> exclusively through Supabase on the server.

## Integrations

- **Telegram** — `src/lib/server/telegram-admin-notifications.ts` sends admin alerts when
  `TELEGRAM_BOT_TOKEN` / `TELEGRAM_ADMIN_CHAT_ID` are set.
- **Google Sheets** — service-account append via the submission adapters.
- **Supabase Storage** — image uploads (`LINKBIO_IMAGES_BUCKET`) and support slip uploads
  (`SUPPORT_UPLOADS_BUCKET`).

## i18n

- `src/i18n/en.ts` and `src/i18n/th.ts` are flat string maps. `th` is typed as
  `Record<keyof typeof en, string>`, so **key parity between locales is enforced at compile
  time** in both directions — a missing or extra key fails `tsc`.

## Feature flags

`src/lib/feature-flags.ts` centralizes all `NEXT_PUBLIC_*` boolean flags (Admin UI V2,
Button/Menu System V2, Form Engine V1, UI Lab mode, responsive V2, safe mode, live-preview
disable). Metadata for each flag is exported for the admin owner surface.

## Known tech debt / future work

- **Monolithic client components** — `src/components/preview/mobile-preview.tsx` (~185 KB)
  and `src/components/admin/sections/links-section.tsx` (~143 KB) are dominated by a single
  very large component body each. `MobilePreview` is already lazy-loaded via `next/dynamic`
  and route-splitting keeps them out of unrelated bundles, but their size slows dev HMR and
  hurts maintainability.
  - Recommended approach (do incrementally, ideally after adding component tests): extract
    self-contained presentational sub-blocks (per link-item editors / per preview section)
    into sibling files that receive plain props, keeping handlers and store wiring in the
    parent. Move pure helpers/constants/type maps out first (lowest risk), then peel off leaf
    UI blocks one at a time, verifying `npm run lint` + `npm run typecheck` + `npm run build`
    after each step. This was intentionally **not** done in bulk here because there is no test
    suite to catch behavioral regressions.

## Verification

- `npm run lint` — ESLint (flat config).
- `npm run typecheck` — `tsc --noEmit` (also enforces i18n parity).
- `npm run build` — production build (Turbopack). Requires valid Supabase env values.
