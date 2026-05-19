# Feature Flags

All UI/UX lab flags are optional and default to `false` when missing. Do not add
these flags to server env validation because they are safe, public, build-time
switches for isolated experiments.

## Flags

| Flag | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_ENABLE_PUBLIC_RESPONSIVE_V2` | `false` | Future public page responsive layout experiments. |
| `NEXT_PUBLIC_ENABLE_ADMIN_UI_V2` | `false` | Future admin interface experiments. |
| `NEXT_PUBLIC_ENABLE_FORM_ENGINE_V1` | `false` | Future form renderer and workflow experiments. |
| `NEXT_PUBLIC_ENABLE_UI_LAB_MODE` | `false` | Enables the protected `/admin/lab` UI/UX lab page. |

Accepted enabled values are `1`, `true`, `yes`, and `on`, case-insensitive.
Any missing or different value is treated as `false`.

## Enable Locally

Add the flag to `.env.local`, then restart the Next.js dev server:

```env
NEXT_PUBLIC_ENABLE_UI_LAB_MODE=true
```

## Enable In Vercel Preview

In Vercel, add the flag under Project Settings > Environment Variables and
scope it to Preview. Redeploy the preview build after changing the value.

Keep production flags disabled unless a separate release plan explicitly enables
them.
