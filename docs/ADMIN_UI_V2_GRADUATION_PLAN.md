# Admin UI V2 Lab Graduation Plan

## Purpose

This plan defines what can safely graduate from the Admin UI V2 Lab into the real production editor and in what order. It is planning only. It does not approve production behavior changes, schema changes, Save/Load changes, Supabase changes, support form changes, Google Sheets changes, or public renderer changes.

The current `/admin/lab` work remains mock-only until a later phase explicitly implements, tests, and feature-flags real production behavior.

## Current Lab Features

- Responsive Preview: mock device review surface for desktop, tablet, and mobile layout states.
- Admin UI V2: mock workspace shell for reviewing future editor navigation, panels, preview framing, and interaction density.
- Design Panel: mock design controls for page and selected block review.
- Button/Menu style mock: local-only selector for future visual styles without touching builder schema or renderers.
- Link Manager mock: mock link selection, reorder, per-link tools, and single prioritized-link behavior.
- Page Settings mock: mock metadata, SEO/social, dirty state, save draft, and publish review controls.
- Publish Flow mock: mock publish readiness, checklist, and action states with no real publishing.
- Form Builder mock: mock template selection, fields, validation hints, routing, and submission preview.
- Analytics mock: static/mock dashboard for range selection, top links, trends, and conversion insights.
- QA checklist: lab-only regression guard for reviewing mock behavior and production safety boundaries.

## Strict Safety Rules

- No production Supabase schema changes without a written SQL proposal, review checklist, and rollback SQL.
- No support form changes.
- No Google Sheets changes.
- No admin auth changes.
- No owner reset changes.
- No public renderer changes unless they are behind a default-off feature flag.
- No main push for experiments.
- No secrets in docs, commits, pull requests, logs, screenshots, or chat.
- No production Save/Load changes without a migration and compatibility plan.
- No destructive overwrite flow for existing profile data.
- Feature flags must default off for production.

## Graduation Phases

### Phase D2 - Button/Menu System V2 Real Schema Plan

Goal: Define the production data shape for Button/Menu System V2 before implementation. The output should be a reviewed schema proposal, migration strategy, compatibility rules, and rollback plan.

Allowed files:

- `docs/BUTTON_MENU_SYSTEM_V2_PLAN.md`
- `docs/ADMIN_UI_V2_GRADUATION_PLAN.md`
- Future phase-specific docs only if approved before editing.

Forbidden files:

- `supabase/**`
- `src/features/builder/**`
- `src/components/public/**`
- `src/components/preview/**`
- `src/app/api/**`
- `src/lib/server/**`
- Save/Load implementation files
- support form files
- Google Sheets integration files

Risk level: Low when docs-only. High if schema or persistence files are changed.

Test checklist:

- Confirm changed files are docs only.
- Confirm target schema is described as a proposal, not implemented.
- Confirm no migrations were added.
- Confirm no generated types were changed.
- Run lint.
- Run build.

Rollback plan:

- Revert the docs proposal commit.
- No data rollback should be needed because no production system changes are allowed.

### Phase D3 - Real Button/Menu Admin Controls

Goal: Implement real admin controls for Button/Menu System V2 behind a default-off feature flag, using the approved D2 schema plan and without changing public rendering.

Allowed files:

- Feature-flag definitions and documentation.
- Admin editor components directly responsible for Button/Menu controls.
- Focused tests for the admin control behavior.
- Docs describing operator usage and rollback.

Forbidden files:

- `src/components/public/**`
- public route files
- Supabase migrations unless separately approved from D2
- support form files
- Google Sheets integration files
- admin auth files
- owner reset files

Risk level: Medium. The editor surface can affect saved profile data if controls write incompatible values.

Test checklist:

- Feature flag defaults off.
- Existing Button/Menu controls behave unchanged when the flag is off.
- New controls render only when the flag is on.
- One prioritized link only.
- No destructive overwrite flow.
- Lint passes.
- Build passes.
- Focused admin tests or manual QA cover edit, cancel, save draft, reload, and disabled flag states.

Rollback plan:

- Disable the feature flag.
- Revert the admin-controls commit if needed.
- Preserve existing saved values; do not run cleanup scripts unless a separate data rollback is reviewed.

### Phase D4 - Real Preview Renderer Update Behind Feature Flag

Goal: Update the authenticated editor preview renderer to display Button/Menu System V2 values behind a default-off feature flag while keeping public pages unchanged.

Allowed files:

- Editor preview renderer files.
- Preview-only style helpers.
- Feature flag docs.
- Focused renderer tests or visual/manual QA docs.

Forbidden files:

- `src/components/public/**`
- public route files
- Supabase migrations
- support form files
- Google Sheets integration files
- Save/Load migration code unless approved by D6

Risk level: Medium. The preview can mislead admins if it diverges from saved data or public rendering.

Test checklist:

- Feature flag defaults off.
- Preview output is unchanged when the flag is off.
- Preview renders each target style when the flag is on.
- URL image loading handles missing, invalid, and empty URLs gracefully.
- `image-full` supports 3:1 and 2:1 aspect ratios.
- `text-panel` preserves line breaks with `white-space: pre-wrap`.
- Lint passes.
- Build passes.

Rollback plan:

- Disable the preview feature flag.
- Revert preview renderer changes.
- No database rollback should be needed.

### Phase D5 - Public Renderer Update Behind Feature Flag

Goal: Update the public renderer for Button/Menu System V2 only behind a default-off feature flag after the admin controls and preview renderer have passed staging validation.

Allowed files:

- Public renderer files required for Button/Menu System V2.
- Public renderer tests.
- Feature flag docs.
- Rollout docs and smoke-test checklist.

Forbidden files:

- Supabase migrations unless separately approved.
- support form files
- Google Sheets integration files
- admin auth files
- owner reset files
- unrelated public page behavior.

Risk level: High. Public renderer changes can affect live visitor pages and conversion behavior.

Test checklist:

- Feature flag defaults off.
- Production public pages render unchanged when the flag is off.
- All target styles render correctly when the flag is on.
- Existing profile data remains compatible.
- Missing image URLs fall back safely.
- Public smoke URLs are checked, including `https://support.bn9.one`.
- Lint passes.
- Build passes.

Rollback plan:

- Disable the public renderer feature flag immediately.
- Revert public renderer changes if needed.
- Keep any saved V2 data ignored by the public renderer until a reviewed cleanup or migration is approved.

### Phase D6 - Save/Load Migration Checks

Goal: Verify Save/Load compatibility, migration needs, and downgrade behavior before enabling production persistence for Button/Menu System V2.

Allowed files:

- Save/Load compatibility tests.
- Migration check scripts if reviewed and non-destructive.
- Docs for data compatibility, validation, and rollback.
- Schema proposal updates if needed.

Forbidden files:

- Production Supabase migrations without approved SQL proposal.
- destructive data scripts.
- public renderer files unless covered by D5.
- support form files.
- Google Sheets integration files.
- admin auth files.
- owner reset files.

Risk level: High. Persistence changes can corrupt or hide profile data.

Test checklist:

- Existing records load without mutation.
- Saving with the flag off preserves existing behavior.
- Saving with the flag on writes only approved V2 fields.
- Unknown future values are ignored or preserved according to the D2 compatibility plan.
- Downgrade behavior is documented.
- Lint passes.
- Build passes.

Rollback plan:

- Disable write paths with the feature flag.
- Restore prior Save/Load implementation if needed.
- Apply reviewed rollback SQL only if an approved migration was run.

### Phase D7 - Staging Supabase Validation

Goal: Validate any approved schema, Save/Load, and renderer behavior against staging Supabase before production rollout.

Allowed files:

- Staging validation docs.
- Reviewed SQL proposal and rollback SQL.
- Non-production validation scripts.
- Test fixtures that contain no secrets and no production data.

Forbidden files:

- production Supabase changes.
- production data export files.
- support form files.
- Google Sheets integration files.
- admin auth files.
- owner reset files.
- unreviewed migrations.

Risk level: High. Staging validation is the last checkpoint before production data risk.

Test checklist:

- SQL proposal reviewed before execution.
- Rollback SQL reviewed before execution.
- Staging migration applies cleanly.
- Staging rollback is tested if feasible.
- Existing staging profiles load and save.
- V2 profiles load, save, and render with flags on.
- Production flags remain off.
- Lint passes.
- Build passes.

Rollback plan:

- Roll back staging using reviewed SQL.
- Disable staging feature flags.
- Document findings before any production attempt.

### Phase D8 - Production Rollout Checklist

Goal: Roll out Button/Menu System V2 to production only after staged validation, documented rollback, and default-off safety checks are complete.

Allowed files:

- Production rollout checklist docs.
- Release notes.
- Approved feature flag configuration changes.
- Reviewed SQL migration files only if D7 has passed and production approval is explicit.

Forbidden files:

- experiments pushed to main.
- unreviewed schema changes.
- support form files.
- Google Sheets integration files.
- admin auth files.
- owner reset files.
- unrelated renderer or editor changes.

Risk level: High. This is the production release phase.

Test checklist:

- Changed files match report.
- Lint passes.
- Build passes.
- Production smoke URLs checked, including `https://support.bn9.one`.
- Vercel Preview ready and reviewed.
- Feature flags default off.
- Rollback documented.
- SQL proposal and rollback SQL approved if database changes are included.
- Support forms unchanged.
- Google Sheets unchanged.
- Admin auth unchanged.
- Owner reset unchanged.
- No secrets appear in docs, logs, commits, or chat.

Rollback plan:

- Disable feature flags first.
- Revert the release commit if needed.
- Run approved rollback SQL only when a production migration has actually been applied and rollback has been approved.
- Re-smoke production URLs after rollback.

## Pre-Merge Checklist

- Changed files match the report.
- Lint passes.
- Build passes.
- Production smoke URLs checked.
- Vercel Preview ready.
- Feature flags default off.
- Rollback documented.
- No production code changed unless the phase explicitly allows it.
- No schema/types/utils changed unless the phase explicitly allows it.
- No public renderer changed unless feature-flagged.
- No API, Supabase, Google Sheets, or support files changed unless explicitly approved for that phase.
