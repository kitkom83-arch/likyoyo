# Button/Menu System V2 Rollout Gates

## Purpose

This document defines the gates that must protect the first Button/Menu System V2 code-touch phase. It is docs-only and does not implement Button/Menu System V2.

Production domain context: `https://support.bn9.one`.

## Gate 1 - Phase Identity

The first implementation phase is:

- D3-A - schema/types/utils/mock-data only

D3-A must not include admin UI, preview, public renderer, persistence, API, Supabase, support form, Google Sheets, auth, or owner reset changes.

## Gate 2 - Allowed Files

D3-A passes this gate only when changed files are limited to:

- `src/features/builder/types.ts`
- `src/features/builder/schema.ts`
- `src/features/builder/utils.ts`
- `src/features/builder/mock-data.ts`

Any other changed file fails the D3-A gate unless the work is stopped and re-planned.

## Gate 3 - Forbidden Files And Areas

D3-A fails if any of these files or areas change:

- `src/components/admin/sections/links-section.tsx`
- `src/components/preview/mobile-preview.tsx`
- `src/components/public/**`
- `src/app/api/**`
- `src/lib/server/**`
- `supabase/migrations/**`
- support forms
- Google Sheets logic
- admin auth
- owner reset logic

## Gate 4 - D3-A Behavior Boundary

D3-A passes this gate only when all of these remain true:

- Existing links stay compatible.
- Missing style values default safely.
- Type-safe fields exist for the five approved styles.
- UI behavior does not change.
- Public rendering does not change.
- Save/load behavior does not change.
- API behavior does not change.
- Supabase schema does not change.
- The feature is not visible to admins or public visitors.

Approved styles:

- `icon-left`
- `image-full`
- `text-only`
- `card-left-image`
- `text-panel`

## Gate 5 - Verification

D3-A is not complete until:

- Changed files match the allowed list.
- `npm run lint` passes.
- `npm run build` passes.
- Existing public pages still build.
- No API changes are present.
- No Supabase changes are present.
- No Google Sheets changes are present.
- No support form changes are present.
- No public renderer changes are present.

## Gate 6 - Production Safety

D3-A must not touch production behavior:

- No public renderer changes.
- No public URL behavior changes.
- No production data writes.
- No production data migration.
- No Supabase migration.
- No support form changes.
- No Google Sheets logic changes.
- No admin auth changes.
- No owner reset logic changes.

## Gate 7 - Rollback

D3-A rollback must stay simple:

- Revert the D3-A commit only.
- No data migration is needed.
- No rollback SQL is needed.
- No data cleanup is needed.
- No feature should be visible yet.

If rollback requires a data migration, SQL rollback, feature flag, support intervention, or production data cleanup, the phase exceeded D3-A scope.

## Gate 8 - Later Phase Boundary

These items are intentionally deferred until later phases:

- `LinksSection` controls.
- `MobilePreview` rendering.
- Public renderer support.
- Save/load behavior changes.
- API changes.
- Supabase migrations.
- support forms.
- Google Sheets logic.
- admin auth.
- owner reset logic.

Opening any of these areas requires a new reviewed phase and cannot be bundled into D3-A.
