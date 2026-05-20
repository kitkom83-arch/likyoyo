# Button/Menu System V2 Plan

## Purpose

This document defines the target shape for Button/Menu System V2 before implementation. It is a plan only. It does not change schema, generated types, Save/Load behavior, Supabase, admin controls, preview rendering, public rendering, support forms, or Google Sheets.

## Target Styles

Button/Menu System V2 should support these styles:

- `icon-left`: compact row with an icon or visual affordance on the left and link text on the right.
- `image-full`: image-led link with the image spanning the full content width.
- `text-only`: text link without image treatment.
- `card-left-image`: card layout with a left image and right text area.
- `text-panel`: text-forward panel for multi-line copy.

## Target Requirements

- Images are URL-only. No uploads are introduced in this phase.
- Text alignment supports `left`, `center`, and `right`.
- `image-full` supports `3:1` and `2:1` aspect ratios.
- `text-panel` preserves line breaks with `white-space: pre-wrap`.
- Exactly one prioritized link is allowed per profile/page context.
- No destructive overwrite flow is allowed.
- Existing saved links must remain readable.
- Unknown or unsupported V2 values must fail safely.
- Feature flags must default off until rollout approval.

## Proposed Data Shape

The exact production schema must be approved in Phase D2 before implementation. A safe target shape should separate stable link identity from optional V2 presentation metadata:

```ts
type ButtonMenuV2Style =
  | "icon-left"
  | "image-full"
  | "text-only"
  | "card-left-image"
  | "text-panel";

type ButtonMenuV2Alignment = "left" | "center" | "right";

type ButtonMenuV2ImageAspectRatio = "3:1" | "2:1";

type ButtonMenuV2Presentation = {
  style: ButtonMenuV2Style;
  textAlign: ButtonMenuV2Alignment;
  imageUrl?: string;
  imageAspectRatio?: ButtonMenuV2ImageAspectRatio;
  text?: string;
};
```

Compatibility rules to confirm in D2:

- Existing links without V2 presentation metadata render through current behavior.
- `imageUrl` is treated as a string URL only; no upload or storage workflow is implied.
- `imageAspectRatio` applies only to `image-full`.
- `text-panel` rendering must preserve line breaks with CSS, not by mutating saved text.
- Prioritization is stored in a way that prevents multiple active prioritized links.
- Invalid enum values fall back to current rendering or a documented safe default.

## Implementation Sequence

### Phase D2 - Schema Plan

Goal: Produce the reviewed schema, migration, validation, compatibility, and rollback proposal.

Allowed files:

- `docs/BUTTON_MENU_SYSTEM_V2_PLAN.md`
- `docs/ADMIN_UI_V2_GRADUATION_PLAN.md`

Forbidden files:

- `supabase/**`
- `src/features/builder/**`
- `src/components/public/**`
- `src/components/preview/**`
- Save/Load files
- API files
- support form files
- Google Sheets files

Risk level: Low when docs-only.

Test checklist:

- Docs describe proposal only.
- No schema, migration, type, utility, renderer, Save/Load, API, Supabase, support, or Google Sheets files changed.
- Lint passes.
- Build passes.

Rollback plan:

- Revert the docs commit.

### Phase D3 - Admin Controls

Goal: Add real editor controls behind a default-off feature flag after D2 approval.

Allowed files:

- Admin editor files scoped to Button/Menu controls.
- Feature flag docs and definitions.
- Focused admin tests.

Forbidden files:

- public renderer files.
- Supabase migrations unless separately approved.
- support form files.
- Google Sheets files.
- admin auth files.
- owner reset files.

Risk level: Medium.

Test checklist:

- Flag off keeps existing controls unchanged.
- Flag on exposes V2 controls.
- URL image input accepts URL strings only.
- Alignment control supports left, center, right.
- `image-full` aspect ratio control supports 3:1 and 2:1.
- Only one prioritized link can be selected.
- Cancel and reload do not overwrite existing data.

Rollback plan:

- Disable the feature flag.
- Revert admin control changes if needed.

### Phase D4 - Preview Renderer

Goal: Render V2 styles in the authenticated editor preview behind a default-off feature flag.

Allowed files:

- Editor preview renderer files.
- Preview-only style helpers.
- Focused preview tests.

Forbidden files:

- public renderer files.
- Supabase files.
- support form files.
- Google Sheets files.
- Save/Load migration files unless D6 approves them.

Risk level: Medium.

Test checklist:

- Flag off keeps preview unchanged.
- Each style renders in preview with mock and saved data.
- Missing image URL does not break layout.
- `image-full` 3:1 and 2:1 layouts are stable.
- `text-panel` uses `white-space: pre-wrap`.

Rollback plan:

- Disable the preview flag.
- Revert preview renderer changes if needed.

### Phase D5 - Public Renderer

Goal: Render V2 styles publicly only behind a default-off feature flag after staging validation.

Allowed files:

- Public renderer files directly required for V2.
- Public renderer tests.
- Rollout docs.

Forbidden files:

- unapproved Supabase migrations.
- support form files.
- Google Sheets files.
- admin auth files.
- owner reset files.
- unrelated public behavior.

Risk level: High.

Test checklist:

- Flag off keeps production pages unchanged.
- Public renderer supports all five target styles with safe fallbacks.
- `text-panel` preserves line breaks.
- Production smoke URLs are checked before merge.
- Vercel Preview is reviewed.

Rollback plan:

- Disable the public feature flag.
- Revert public renderer changes if needed.

### Phase D6 - Save/Load and Migration Checks

Goal: Confirm persistence compatibility and migration behavior before enabling V2 writes broadly.

Allowed files:

- Save/Load compatibility tests.
- Non-destructive validation scripts.
- Migration proposal docs.

Forbidden files:

- production Supabase schema changes without approved SQL proposal.
- destructive scripts.
- support form files.
- Google Sheets files.
- admin auth files.
- owner reset files.

Risk level: High.

Test checklist:

- Existing records load unchanged.
- Flag off saves unchanged payloads.
- Flag on writes only approved V2 fields.
- Invalid values are rejected or normalized according to the approved plan.
- Rollback behavior is documented.

Rollback plan:

- Disable V2 writes.
- Revert Save/Load changes if needed.
- Run reviewed rollback SQL only if an approved migration was applied.

## Pre-Merge Checklist

- Changed files match report.
- Lint passes.
- Build passes.
- Production smoke URLs checked.
- Vercel Preview ready.
- Feature flags default off.
- Rollback documented.
- No secrets in docs, commits, logs, screenshots, or chat.
- Supabase schema changes have an SQL proposal and rollback SQL before execution.
- Support forms unchanged.
- Google Sheets unchanged.
- Admin auth unchanged.
- Owner reset unchanged.
