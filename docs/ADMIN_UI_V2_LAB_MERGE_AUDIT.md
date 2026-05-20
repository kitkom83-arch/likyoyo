# Admin UI V2 Lab Merge Audit

## Branch

- Branch: `codex/fix-public-page-routes`
- Audited commit before this report: `65767da Add Admin UI V2 lab handoff docs`
- Production domain context: `https://support.bn9.one`
- Comparison base: local `main`

## C1-C10 Summary

- C1 Visual polish: completed in the lab prototype.
- C2 Mock interactions: completed with local component state.
- C3 Design panel and Button/Menu style mock: completed as mock-only UI.
- C4 Link Manager and Per-Link Tools mock: completed as mock-only UI.
- C5 Page Settings and Publish Flow mock: completed as mock-only UI.
- C6 Form Builder and Submission Flow mock: completed as mock-only UI.
- C7 Analytics Dashboard and Conversion Insights mock: completed with static/mock data.
- C8 Lab-only refactor: completed for Admin UI V2 mock modules under `src/components/admin/lab/`.
- C9 QA Checklist and Regression Guard: completed in the Admin UI V2 tab.
- C10 Lab handoff documentation: completed in `docs/ADMIN_UI_V2_LAB_HANDOFF.md`.

## Changed File Groups

`git diff --name-only main..codex/fix-public-page-routes` and `git diff --stat main..codex/fix-public-page-routes` show 33 files changed with 7,255 insertions and 113 deletions before this audit report.

Expected lab/docs/local lab access scope:

- `docs/ADMIN_UI_V2_LAB_HANDOFF.md`
- `docs/FEATURE_FLAGS.md`
- `src/app/admin/lab/page.tsx`
- `src/components/admin/lab/**`
- `src/lib/feature-flags.ts`
- `src/proxy.ts`

Files outside the narrow lab/docs scope:

- `src/app/admin/login/page.tsx`
- `src/components/admin/admin-shell.tsx`
- `src/components/admin/data-tools-card.tsx`
- `src/components/admin/owner-control-client.tsx`
- `src/components/admin/sections/header-section.tsx`
- `src/components/admin/shared/custom-image-upload.tsx`
- `src/components/preview/mobile-preview.tsx`
- `src/components/profile/profile-header.tsx`
- `src/components/public/public-profile-page-client.tsx`
- `src/features/builder/schema.ts`
- `src/features/builder/utils.ts`

## Risky File Audit

The branch changes files that the C11 audit instructions explicitly classify as risky:

- `src/components/admin/admin-shell.tsx`
- `src/components/preview/mobile-preview.tsx`
- `src/components/public/public-profile-page-client.tsx`
- `src/features/builder/schema.ts`
- `src/features/builder/utils.ts`

Observed risky themes in the diff:

- Public handle fallback and normalization behavior changed in production admin/public paths.
- Real `MobilePreview` behavior changed.
- Real public profile client normalization changed.
- Real builder schema and normalization utilities changed.

No changes were found under:

- `src/app/api/**`
- `src/lib/server/**`
- `supabase/migrations/**`
- `src/app/support/**`
- `src/components/support/**`

## Safety Grep Summary

Commands run under `src/components/admin/lab`:

- `git grep -n "fetch(" src/components/admin/lab`: no matches.
- `git grep -n "createClient" src/components/admin/lab`: no matches.
- `git grep -n "supabase" src/components/admin/lab`: no code/import matches; only safety label text mentions Supabase.
- `git grep -n "Google Sheets" src/components/admin/lab`: matches are labels, mock data strings, and safety text.
- `git grep -n "webhook" src/components/admin/lab`: matches are mock routing booleans, labels, and safety text.
- `git grep -n "tracking" src/components/admin/lab`: matches are CSS `tracking-*` classes and safety text; no tracking implementation.

Interpretation: lab safety grep passed. The matches are labels, mock state, or explanatory safety text, not real API/Supabase/Google Sheets/webhook/tracking calls.

## Lab Smoke Check

Smoke test used `http://localhost:3000/admin/lab` with:

```env
ENABLE_LOCAL_LAB_ACCESS=true
NEXT_PUBLIC_ENABLE_UI_LAB_MODE=true
```

Result:

- `/admin/lab` returned HTTP 200.
- Admin UI V2 tab rendered.
- QA / Regression Guard panel rendered.
- Page selection worked.
- Form selection worked.
- Analytics range selection worked.
- Top-link analytics selection worked.
- Desktop global horizontal overflow: false.
- 390px mobile global horizontal overflow: false.

## Build Checks

- `npm run lint`: passed.
- `npm run build`: passed.

## Merge Recommendation

Recommendation: not ready.

Blocker:

- The branch changes production-adjacent files that C11 explicitly flags as risky, including real admin shell, real mobile preview, real public profile client, and real builder schema/utils. Those diffs include production public handle/header normalization behavior, so the branch is not limited to Lab/docs/local lab access scope.

Notes before merge:

- Either split the non-lab production route/public handle work into a separate reviewed branch, or obtain explicit approval that those production changes belong in this merge.
- Keep the Admin UI V2 Lab mock work isolated from production editor, public renderer, API, Supabase, Google Sheets, support forms, auth, owner reset, and migration changes.
