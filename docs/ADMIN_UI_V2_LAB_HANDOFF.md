# Admin UI V2 Lab Handoff

## Purpose

`/admin/lab` is a local and preview-only UI/UX lab for reviewing Admin UI V2 prototype work before deciding what, if anything, should graduate into the real admin implementation.

The lab is intentionally mock-only. It is safe for design review, manual QA, and merge readiness checks because it does not save data, publish pages, call APIs, connect to Supabase, write to Google Sheets, trigger webhooks, or send tracking events.

Do not treat any lab behavior as production behavior. The production admin editor, public renderer, support flows, auth, APIs, Supabase logic, and migrations are outside the scope of this prototype.

## Local Access

1. Add these flags to `.env.local`:

```env
ENABLE_LOCAL_LAB_ACCESS=true
NEXT_PUBLIC_ENABLE_UI_LAB_MODE=true
```

2. Restart the local dev server.
3. Open `/admin/lab` on `localhost` or `127.0.0.1`.
4. Select the `Admin UI V2` tab.

`ENABLE_LOCAL_LAB_ACCESS=true` only exists to allow local lab review without creating a real admin session. `NEXT_PUBLIC_ENABLE_UI_LAB_MODE=true` enables the lab route UI.

## Current Admin UI V2 Lab Scope

The Admin UI V2 tab currently includes mock review surfaces for:

- Page and block selection.
- Device preview mode switching.
- Button and menu visual style selection.
- Link Manager selection, reorder, per-link tools, and prioritization.
- Page settings, dirty state, save draft mock, and publish mock.
- Form builder template selection, field selection, field reorder, validation hints, submission preview, and routing mock.
- Analytics dashboard with time range controls, conversion insights, top link analytics, and trend cards.
- QA checklist and regression guard panel.

All interactions are local component state only. No interaction performs real persistence, publish, API, Supabase, Google Sheets, webhook, or tracking work.

## C1-C9 Coverage

- C1 Visual polish: the lab has polished Admin UI V2 visual treatment for the workspace, preview, panels, states, and responsive layout review.
- C2 Mock interactions: page selection, block selection, device mode changes, and interactive preview states are represented with local mock state.
- C3 Design/Button mock: design controls include button/menu style mock review without changing real theme or builder systems.
- C4 Link Manager mock: link selection, reorder, per-link tools, and priority behavior are represented as mock UI only.
- C5 Page Settings/Publish mock: page settings, dirty state, save draft, publish review, SEO/social, and checklist states are mock-only.
- C6 Form Builder mock: form templates, field builder, field selection/reorder, validation, submission preview, and routing are mock-only.
- C7 Analytics mock: analytics dashboard, time range, top links, conversion insights, and trend summaries use static/mock data only.
- C8 Refactor: Admin UI V2 lab pieces are split into lab-only mock modules under `src/components/admin/lab/`.
- C9 QA checklist/regression guard: the lab includes a QA / Regression Guard panel to make manual review and safety checks visible.

## Manual QA Checklist

Use this checklist before merge readiness signoff:

- Open `/admin/lab` locally with both required flags enabled.
- Confirm the `Admin UI V2` tab renders.
- Change page selection and confirm the mock preview/panels update.
- Select different blocks and confirm active block state changes.
- Toggle device mode and confirm preview frame changes without layout breakage.
- Change the button style selector and confirm only mock visual state changes.
- Select a link in Link Manager and confirm its details/tools update.
- Reorder links and confirm the mock order changes.
- Prioritize one link and confirm only one link is marked as prioritized.
- Edit page settings and confirm dirty state appears.
- Use save draft mock and confirm it remains a mock status/action.
- Use publish mock and confirm it remains a mock status/action.
- Select a form template and confirm mock form state updates.
- Select form fields and confirm active field details update.
- Reorder form fields and confirm the mock order changes.
- Review routing mock controls and confirm no real destination is contacted.
- Change analytics time range and confirm mock analytics data updates.
- Review top link analytics and confirm it uses mock/static data.
- At 390px viewport width, confirm there is no horizontal overflow.
- Confirm the QA / Regression Guard panel still renders.

## Safety Checklist

Reviewers must verify:

- No real save is possible.
- No real publish is possible.
- No API calls are added or invoked.
- No Supabase calls are added or invoked.
- No Google Sheets calls are added or invoked.
- No webhook calls are added or invoked.
- No tracking calls are added or invoked.
- No public renderer files or behavior changed.
- No support form files or behavior changed.
- No admin auth files or behavior changed.
- No Supabase migrations were added or modified.
- No production editor components were imported into the lab.
- No real builder schema, types, or utilities were imported into the lab.

## Future Graduation Notes

Any real implementation should be split into separate, reviewed phases. Do not graduate lab code directly into production without a dedicated implementation plan, tests, and rollout guardrails.

Suggested future phases:

- Button/Menu System V2.
- Real Link Manager.
- Real Page Settings and Publish Flow.
- Real Form Engine.
- Real Analytics.
- Staging Supabase first.
- Feature flags before production.

Each phase should define data ownership, API boundaries, migration impact, tracking requirements, rollback behavior, and production feature flag strategy before touching real systems.

## Merge Readiness Notes

For Phase C10, merge readiness means documentation exists and the current mock-only prototype remains behaviorally unchanged.

Expected verification:

- Only docs, or lab-only note/link changes if needed, are modified.
- Lint passes.
- Build passes.
- `/admin/lab` still opens locally with `ENABLE_LOCAL_LAB_ACCESS=true` and `NEXT_PUBLIC_ENABLE_UI_LAB_MODE=true`.
- Admin UI V2 tab still renders.
- QA checklist panel still renders.
- Existing mock interactions still work.
- Real editor, public renderer, API, Supabase, Google Sheets, webhook, tracking, support, auth, owner reset, public handle fallback, and migration files are untouched.
