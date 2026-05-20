# Button/Menu System V2 Code-Touch Checklist

## Purpose

This checklist defines the first real code-touch phase for Button/Menu System V2. It is readiness documentation only. It does not implement Button/Menu System V2, change production behavior, change persistence, or expose new UI.

Production domain context: `https://support.bn9.one`.

## Exact First Implementation Phase

D3-A - schema/types/utils/mock-data only.

D3-A is the first implementation phase after the D1 graduation plan and D2 Button/Menu System V2 implementation/schema plan. It must stay additive and type-safe, and it must not make the feature visible.

## D3-A Allowed Files

Only these files may be changed during D3-A:

- `src/features/builder/types.ts`
- `src/features/builder/schema.ts`
- `src/features/builder/utils.ts`
- `src/features/builder/mock-data.ts`

Any required change outside this list means D3-A is not ready to proceed and must be split into a later phase.

## D3-A Forbidden Files And Areas

D3-A must not change these files or areas:

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

## D3-A Goal

D3-A may only prepare the data boundary for future Button/Menu System V2 work:

- Add type-safe fields for the five Button/Menu System V2 styles:
  - `icon-left`
  - `image-full`
  - `text-only`
  - `card-left-image`
  - `text-panel`
- Keep existing links compatible when V2 fields are absent.
- Default missing style values safely, using the existing production behavior or `text-only` fallback documented in the D2 notes.
- Keep unknown or invalid style values from breaking existing profiles.
- Add or adjust mock data only inside the allowed builder mock-data file.
- Do not change UI behavior.
- Do not change public rendering.
- Do not change save/load behavior.
- Do not change API behavior.
- Do not change Supabase schema or migrations.

## Required Pre-Commit Checks

Before any D3-A implementation commit:

- Changed files must match the D3-A allowed file list exactly.
- `npm run lint` must pass.
- `npm run build` must pass.
- Existing public pages must still build.
- There must be no changes under `src/components/public/**`.
- There must be no changes under `src/app/api/**`.
- There must be no changes under `src/lib/server/**`.
- There must be no changes under `supabase/migrations/**`.
- There must be no support form changes.
- There must be no Google Sheets logic changes.
- There must be no admin auth changes.
- There must be no owner reset logic changes.
- There must be no public renderer change.

## D3-A Review Checklist

Use this checklist before requesting review:

- Only the four allowed D3-A files changed.
- Style enum or equivalent type covers exactly the five approved styles.
- Existing link records without V2 fields remain valid.
- Missing `style` resolves to a safe default.
- Missing image fields remain valid.
- `text-panel` line-break intent is represented without changing rendering yet.
- Mock data covers all five styles without affecting production data.
- No UI component imports, props, or render paths changed.
- No public renderer files changed.
- No persistence, API, server, Supabase, support form, Google Sheets, auth, or owner reset files changed.
- Lint passes.
- Build passes.

## Rollback Plan

If D3-A causes any issue:

- Revert the D3-A commit only.
- Do not run a data migration.
- Do not run data cleanup.
- Do not modify production records.
- No feature flag disable step should be needed because D3-A is not visible yet.
- Public pages should remain unaffected because D3-A does not touch public rendering.

## Stop Conditions

Stop D3-A immediately if implementation appears to require:

- `LinksSection` changes.
- `MobilePreview` changes.
- Public renderer changes.
- Save/load behavior changes.
- API route changes.
- Server library changes.
- Supabase migrations.
- support form changes.
- Google Sheets changes.
- admin auth changes.
- owner reset logic changes.

Any of those requirements belongs to a later reviewed phase, not D3-A.
