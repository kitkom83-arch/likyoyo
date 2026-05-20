# Button/Menu System V2 Implementation Plan

## Purpose

This document is a docs-only technical plan for implementing Button/Menu System V2 in the real production editor later. It does not implement the system and does not change schema, public rendering, `MobilePreview`, `LinksSection`, Save/Load, Supabase, support forms, or Google Sheets.

Production domain context: `https://support.bn9.one`.

## Target Real Data Model

Button/Menu System V2 should extend real menu/button items with optional presentation fields while preserving existing link behavior. Existing links must continue to load and render even when none of the V2 fields are present.

Target style values:

- `icon-left`: standard link row with an icon or image affordance on the left.
- `image-full`: image-led link where the image spans the item width.
- `text-only`: text-only item using current/default button behavior.
- `card-left-image`: card layout with an image area on the left and text on the right.
- `text-panel`: multi-line text panel for richer body copy.

Target item fields:

- `title`: required display label for the item.
- `description` or `body`: optional supporting text; `body` is preferred for `text-panel` if existing naming allows it.
- `href` or `url`: required destination URL; keep the existing production field name if one already exists.
- `openInNewTab`: boolean that controls link target behavior.
- `style`: one of the five V2 style values; missing values must fall back safely.
- `textAlign`: `left`, `center`, or `right`.
- `imageUrl`: URL-only image field for item imagery.
- `backgroundImageUrl`: URL-only background image field for styles that explicitly support background imagery.
- `imageAspect`: `3:1` or `2:1`, used by `image-full`.
- `preserveLineBreaks`: boolean; required for `text-panel` rendering and should map to `white-space: pre-wrap`.
- `enabled`: boolean that controls whether the item is active.
- `featured` or `prioritized`: boolean marker for the single emphasized item; final naming should match the existing codebase vocabulary.

## Migration Strategy

- Existing links must keep working without mutation.
- Existing link records must not be destructively overwritten during migration or Save/Load.
- Missing `style` must default to `text-only` or the current production default, whichever preserves existing rendering more accurately.
- Missing `textAlign` should default to the current item alignment or `center` only if that matches existing behavior.
- Missing `openInNewTab`, `enabled`, and image fields should preserve current behavior.
- Exactly one item can be `featured` or `prioritized` in a profile/page context.
- If more than one existing item is somehow marked prioritized, normalization should pick a deterministic winner and preserve the rest of the data without deleting it.
- `text-panel` must preserve user-authored line breaks with CSS (`white-space: pre-wrap`) rather than rewriting stored text.
- URL image fields must fail safely when empty, invalid, unreachable, or unsupported by the renderer.
- Unknown `style`, `textAlign`, or `imageAspect` values must fall back to documented safe defaults.
- No migration may require production Supabase schema changes without a SQL proposal and rollback SQL.

## Implementation Phases

### Phase 1 - Schema and Types Update

Goal: Add the approved Button/Menu V2 fields to production types and schema boundaries after the D2 schema notes are reviewed.

Allowed files:

- Builder schema/type files that own real menu/button item definitions.
- Generated or manually maintained type files only if they are already part of the established workflow.
- Focused validation tests.

Forbidden files:

- Public renderer files.
- `MobilePreview` files.
- `LinksSection` files.
- Save/Load implementation files.
- Supabase migrations without SQL proposal.
- support form files.
- Google Sheets files.

Risk level: High if persistence contracts change; medium if types are additive only.

Test checklist:

- Existing link fixtures still type-check.
- Missing V2 fields remain valid.
- Invalid enum values are rejected or normalized at the boundary.
- Lint passes.
- Build passes.

Rollback plan:

- Revert schema/type changes.
- Do not run data cleanup unless a reviewed migration has already been applied.

### Phase 2 - Utils Normalization Update

Goal: Normalize V2 fields into safe defaults without mutating existing saved data unexpectedly.

Allowed files:

- Existing builder/link normalization utilities.
- Focused tests for fallback behavior.

Forbidden files:

- Public renderer files.
- `MobilePreview` files.
- `LinksSection` files.
- Supabase files.
- support form files.
- Google Sheets files.

Risk level: Medium. Normalization can change runtime behavior if defaults are wrong.

Test checklist:

- Missing `style` resolves to `text-only` or current default.
- Unknown styles fall back safely.
- URL image fields remain optional.
- Only one prioritized item is active after normalization.
- `text-panel` line breaks are preserved in the render contract.

Rollback plan:

- Disable any related feature flag.
- Revert normalization changes.

### Phase 3 - Mock Data Update

Goal: Update lab or test mock data so every V2 style can be reviewed without touching production persistence.

Allowed files:

- Lab-only mock data.
- Test fixtures.
- Docs.

Forbidden files:

- Production Save/Load files.
- Public renderer files.
- Supabase files.
- support form files.
- Google Sheets files.

Risk level: Low if mock-only.

Test checklist:

- Each style has at least one fixture.
- Fixtures include missing-image and invalid-image cases.
- `text-panel` fixture includes multiple lines.
- Existing mock scenarios still render.

Rollback plan:

- Revert mock fixture changes.

### Phase 4 - Admin `LinksSection` Controls

Goal: Add real admin controls for V2 fields behind a default-off feature flag.

Allowed files:

- `LinksSection` and directly related admin editor controls.
- Admin-only validation helpers.
- Feature flag docs/definitions.
- Focused admin tests.

Forbidden files:

- Public renderer files.
- Supabase migrations without SQL proposal.
- support form files.
- Google Sheets files.
- admin auth files.
- owner reset files.

Risk level: Medium to high because admin controls can affect saved link data.

Test checklist:

- Feature flag off keeps current `LinksSection` behavior unchanged.
- Feature flag on exposes V2 controls.
- Editors can set all five styles.
- URL images are URL-only.
- Alignment supports left, center, right.
- Only one item can be prioritized.
- No destructive overwrite occurs when switching styles.

Rollback plan:

- Disable the feature flag.
- Revert admin control changes if needed.

### Phase 5 - `MobilePreview` Update

Goal: Update authenticated admin preview rendering for V2 styles behind a default-off feature flag.

Allowed files:

- `MobilePreview` and directly related preview helpers/styles.
- Preview tests or visual QA docs.

Forbidden files:

- Public renderer files.
- Supabase files.
- Save/Load implementation files unless Phase 7 approves them.
- support form files.
- Google Sheets files.

Risk level: Medium. Preview drift can mislead admins.

Test checklist:

- Feature flag off keeps current preview unchanged.
- Each style renders in preview when the flag is on.
- `image-full` supports `3:1` and `2:1`.
- URL image fallback is visually safe.
- `text-panel` uses `white-space: pre-wrap`.

Rollback plan:

- Disable the preview feature flag.
- Revert preview changes if needed.

### Phase 6 - Public Renderer Update Behind Feature Flag

Goal: Update production public rendering only behind a default-off feature flag after admin and preview validation.

Allowed files:

- Public renderer files directly required for Button/Menu V2.
- Public renderer tests.
- Rollout docs.

Forbidden files:

- Unrelated public behavior.
- Supabase schema changes without SQL proposal.
- support form files.
- Google Sheets files.
- admin auth files.
- owner reset files.

Risk level: High because public pages affect live visitors.

Test checklist:

- Feature flag off keeps public pages unchanged.
- Each new button style renders when enabled.
- Existing links still render.
- URL images fallback safely.
- `text-panel` preserves line breaks.
- Production smoke URLs are checked, including `https://support.bn9.one`.
- Lint passes.
- Build passes.

Rollback plan:

- Disable the public renderer feature flag first.
- Revert public renderer changes if needed.

### Phase 7 - Save/Load Validation

Goal: Validate persistence compatibility before enabling V2 writes broadly.

Allowed files:

- Save/Load validation tests.
- Non-destructive compatibility utilities.
- Docs for migration checks and rollback.

Forbidden files:

- Production Supabase schema changes without SQL proposal.
- Destructive scripts.
- support form files.
- Google Sheets files.
- admin auth files.
- owner reset files.

Risk level: High because Save/Load changes can corrupt real profiles.

Test checklist:

- Existing links load unchanged.
- Existing links save without losing data.
- V2 fields save only when the feature is enabled.
- Unknown V2 fields are preserved or rejected according to the approved schema notes.
- Multiple prioritized links cannot be saved.
- Lint passes.
- Build passes.

Rollback plan:

- Disable V2 writes.
- Revert Save/Load changes.
- Apply reviewed rollback SQL only if an approved migration was applied.

## Forbidden Areas

- No support form changes.
- No Google Sheets changes.
- No admin auth changes.
- No owner reset changes.
- No Supabase schema changes without a reviewed SQL proposal and rollback SQL.
- No production public renderer changes without a default-off feature flag.
- No secrets in docs, commits, pull requests, logs, screenshots, or chat.
- No main push for experiments.

## Pre-Merge Test Checklist

- Existing links still render.
- Each new button style renders.
- URL images fallback safely.
- `text-panel` preserves line breaks.
- Only one featured/prioritized item can be active.
- Feature flags default off.
- Lint passes.
- Build passes.
- Production smoke URLs checked, including `https://support.bn9.one`.
- Vercel Preview ready for any future implementation PR.
- Rollback plan documented.
