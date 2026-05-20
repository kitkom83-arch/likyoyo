# Feature Flags

All UI/UX lab flags are optional and default to `false` when missing. Do not add
these flags to server env validation because they are safe, public, build-time
switches for isolated experiments.

## Flags

| Flag | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_ENABLE_PUBLIC_RESPONSIVE_V2` | `false` | Future public page responsive layout experiments. |
| `NEXT_PUBLIC_ENABLE_ADMIN_UI_V2` | `false` | Future admin interface experiments. |
| `NEXT_PUBLIC_ENABLE_BUTTON_MENU_V2_ADMIN` | `false` | Enables Button/Menu System V2 controls in the admin link editor only. No public renderer behavior changes yet. |
| `NEXT_PUBLIC_ENABLE_BUTTON_MENU_V2_PREVIEW` | `false` | Enables Button/Menu System V2 rendering in the authenticated admin MobilePreview only. No public renderer behavior changes yet. |
| `NEXT_PUBLIC_ENABLE_FORM_ENGINE_V1` | `false` | Future form renderer and workflow experiments. |
| `NEXT_PUBLIC_ENABLE_UI_LAB_MODE` | `false` | Enables the protected `/admin/lab` UI/UX lab page. |
| `ENABLE_LOCAL_LAB_ACCESS` | `false` | Allows `/admin/lab` to bypass admin login on `localhost` or `127.0.0.1` in `next dev` only. |

Accepted enabled values are `1`, `true`, `yes`, and `on`, case-insensitive.
Any missing or different value is treated as `false`.

## Enable Locally

Add the flag to `.env.local`, then restart the Next.js dev server:

```env
ENABLE_LOCAL_LAB_ACCESS=true
NEXT_PUBLIC_ENABLE_UI_LAB_MODE=true
NEXT_PUBLIC_ENABLE_BUTTON_MENU_V2_ADMIN=true
NEXT_PUBLIC_ENABLE_BUTTON_MENU_V2_PREVIEW=true
```

`ENABLE_LOCAL_LAB_ACCESS` is only honored when `NODE_ENV` is `development`, the
request host is `localhost` or `127.0.0.1`, and the path is `/admin/lab`. It does
not create an admin session and does not bypass `/admin` or `/admin/owner`.

## Enable In Vercel Preview

In Vercel, add the flag under Project Settings > Environment Variables and
scope it to Preview. Redeploy the preview build after changing the value.

Keep production flags disabled unless a separate release plan explicitly enables
them.

## Button/Menu System V2 Admin Controls

`NEXT_PUBLIC_ENABLE_BUTTON_MENU_V2_ADMIN` is default-off when missing. When
enabled, the admin `LinksSection` layout editor shows controls for Button/Menu
System V2 fields only. Preview rendering, public rendering, save/load plumbing,
APIs, Supabase, support forms, and Google Sheets integrations are unchanged in
this phase.

Rollback is to disable `NEXT_PUBLIC_ENABLE_BUTTON_MENU_V2_ADMIN` and redeploy so
the admin editor returns to the pre-V2 controls.

## Button/Menu System V2 MobilePreview Rendering

`NEXT_PUBLIC_ENABLE_BUTTON_MENU_V2_PREVIEW` is default-off when missing. When
enabled, the authenticated admin `MobilePreview` can render Button/Menu System
V2 styles for preview only. Public rendering, save/load plumbing, APIs,
Supabase, support forms, and Google Sheets integrations are unchanged in this
phase.

Rollback is to disable `NEXT_PUBLIC_ENABLE_BUTTON_MENU_V2_PREVIEW` and redeploy
so the admin preview returns to the pre-V2 renderer.
