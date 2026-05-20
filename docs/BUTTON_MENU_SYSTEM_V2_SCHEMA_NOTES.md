# Button/Menu System V2 Schema Notes

## Purpose

These notes define the proposed real data model for Button/Menu System V2. They are planning notes only and do not change production schema, generated types, Supabase, Save/Load, renderers, support forms, or Google Sheets.

## Proposed Item Shape

The final implementation should keep the existing production link identity and destination fields wherever possible, then add optional V2 presentation fields.

```ts
type ButtonMenuV2Style =
  | "icon-left"
  | "image-full"
  | "text-only"
  | "card-left-image"
  | "text-panel";

type ButtonMenuV2TextAlign = "left" | "center" | "right";

type ButtonMenuV2ImageAspect = "3:1" | "2:1";

type ButtonMenuV2Item = {
  id: string;
  title: string;
  description?: string;
  body?: string;
  href: string;
  url?: string;
  openInNewTab: boolean;
  style?: ButtonMenuV2Style;
  textAlign?: ButtonMenuV2TextAlign;
  imageUrl?: string;
  backgroundImageUrl?: string;
  imageAspect?: ButtonMenuV2ImageAspect;
  preserveLineBreaks?: boolean;
  enabled: boolean;
  featured?: boolean;
  prioritized?: boolean;
};
```

Implementation note: this shape is intentionally descriptive, not a required TypeScript diff. The real implementation should map to the existing production naming conventions. If production already uses `url`, do not introduce `href` just for V2. If production already uses `featured`, do not introduce `prioritized` unless the migration plan explicitly maps between them.

## Field Notes

| Field | Requirement | Default or fallback |
| --- | --- | --- |
| `title` | Required display text. | Existing link title/label. |
| `description` / `body` | Optional supporting copy. | Empty string or omitted. |
| `href` / `url` | Required destination. | Existing destination field. |
| `openInNewTab` | Boolean target behavior. | Existing behavior. |
| `style` | V2 visual style enum. | `text-only` or current production default. |
| `textAlign` | `left`, `center`, `right`. | Existing alignment or current default. |
| `imageUrl` | URL-only image field. | Omitted; renderer uses non-image fallback. |
| `backgroundImageUrl` | URL-only background image field. | Omitted; renderer uses normal background. |
| `imageAspect` | `3:1` or `2:1`. | `3:1` for `image-full` unless current design requires `2:1`. |
| `preserveLineBreaks` | Boolean line-break rendering hint. | `true` for `text-panel`, otherwise `false`. |
| `enabled` | Boolean item visibility state. | Existing enabled/active behavior. |
| `featured` / `prioritized` | Single emphasized item marker. | No item prioritized unless existing data says otherwise. |

## Style Contracts

### `icon-left`

- Uses `title` as primary text.
- May use `description` as secondary text if the real UI supports it.
- May use `imageUrl` as a left icon/image if present.
- Falls back to current icon treatment when image is missing.

### `image-full`

- Uses `imageUrl` or `backgroundImageUrl` as URL-only imagery.
- Supports `imageAspect` values `3:1` and `2:1`.
- Must render a safe non-image fallback if the URL is missing or invalid.
- Uses `title` and optional `description` as overlay or adjacent copy according to the approved design.

### `text-only`

- Uses `title` and optional `description` with no required image.
- Should be the safest fallback for missing or unknown V2 style values unless the current production default is different.

### `card-left-image`

- Uses `imageUrl` as URL-only left-side image.
- Uses `title` and optional `description` or `body` on the right.
- Must preserve layout when image is missing.

### `text-panel`

- Uses `title` plus `body` or `description`.
- Requires line breaks to be preserved with `white-space: pre-wrap`.
- Should set or infer `preserveLineBreaks: true`.
- Does not require imagery.

## Normalization Rules

- Do not mutate persisted records just to apply defaults at read time.
- Missing `style` resolves to `text-only` or current production default.
- Missing `textAlign` resolves to current production alignment behavior.
- Missing `imageAspect` on `image-full` resolves to `3:1` unless design approval chooses `2:1`.
- Unknown `style` resolves to the safe fallback.
- Unknown `textAlign` resolves to the safe fallback.
- Unknown `imageAspect` resolves to the safe fallback.
- Empty `imageUrl` and `backgroundImageUrl` are treated as absent.
- Invalid image URLs must not break rendering or Save/Load.
- `text-panel` must preserve line breaks at render time without rewriting stored copy.
- Only one item may be featured/prioritized after normalization.

## Migration Strategy

- Existing links must keep working exactly as they do today when V2 fields are absent.
- Existing link records should not be bulk rewritten unless a reviewed migration proves it is required.
- V2 fields should be additive where possible.
- Missing `style` must default to `text-only` or current default.
- No destructive overwrite flow is allowed when switching styles.
- Existing destination URLs, enabled states, ordering, and titles must be preserved.
- One prioritized link only; if legacy data has multiple markers, pick a deterministic winner at normalization time and do not delete the other records.
- `text-panel` line breaks must be preserved with CSS (`white-space: pre-wrap`).
- Any production Supabase schema change requires a SQL proposal and rollback SQL before implementation.

## Validation Checklist

- Existing links without V2 fields validate.
- Each V2 style validates.
- `image-full` accepts only `3:1` or `2:1` for `imageAspect`.
- Text alignment accepts only `left`, `center`, or `right`.
- URL image fields are optional and URL-only.
- Multiple prioritized items are rejected or normalized before save.
- `text-panel` preserves line breaks.
- Unknown enum values fail safely.

## Forbidden Areas

- No support form changes.
- No Google Sheets changes.
- No admin auth changes.
- No owner reset changes.
- No Supabase schema changes without SQL proposal.
- No production public renderer changes without a default-off feature flag.
- No Save/Load implementation changes in this planning phase.
- No `MobilePreview` changes in this planning phase.
- No `LinksSection` changes in this planning phase.

## Rollback Notes

- If the future implementation is type-only, revert the type/schema commit.
- If future Save/Load writes are enabled, disable the feature flag before reverting code.
- If an approved Supabase migration is ever applied, rollback must use the reviewed rollback SQL.
- Public rendering changes must be removable by disabling the feature flag.
- Existing links must remain readable throughout rollback.
