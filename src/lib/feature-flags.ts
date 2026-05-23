const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

export const readPublicBooleanFlagValue = (value: string | undefined): boolean =>
  typeof value === "string" && TRUE_VALUES.has(value.trim().toLowerCase());

export const featureFlags = {
  publicResponsiveV2: readPublicBooleanFlagValue(process.env.NEXT_PUBLIC_ENABLE_PUBLIC_RESPONSIVE_V2),
  adminUiV2: readPublicBooleanFlagValue(process.env.NEXT_PUBLIC_ENABLE_ADMIN_UI_V2),
  adminLivePreviewDisabled: readPublicBooleanFlagValue(
    process.env.NEXT_PUBLIC_DISABLE_ADMIN_LIVE_PREVIEW,
  ),
  buttonMenuV2Admin: readPublicBooleanFlagValue(
    process.env.NEXT_PUBLIC_ENABLE_BUTTON_MENU_V2_ADMIN,
  ),
  buttonMenuV2Preview: readPublicBooleanFlagValue(
    process.env.NEXT_PUBLIC_ENABLE_BUTTON_MENU_V2_PREVIEW,
  ),
  buttonMenuV2Public: readPublicBooleanFlagValue(
    process.env.NEXT_PUBLIC_ENABLE_BUTTON_MENU_V2_PUBLIC,
  ),
  formEngineV1: readPublicBooleanFlagValue(process.env.NEXT_PUBLIC_ENABLE_FORM_ENGINE_V1),
  uiLabMode: readPublicBooleanFlagValue(process.env.NEXT_PUBLIC_ENABLE_UI_LAB_MODE),
} as const;

export type FeatureFlagKey = keyof typeof featureFlags;

export const featureFlagMetadata: Array<{
  key: FeatureFlagKey;
  envName: string;
  label: string;
  description: string;
}> = [
  {
    key: "publicResponsiveV2",
    envName: "NEXT_PUBLIC_ENABLE_PUBLIC_RESPONSIVE_V2",
    label: "Public Responsive V2",
    description: "Future public page responsive layout experiments.",
  },
  {
    key: "adminUiV2",
    envName: "NEXT_PUBLIC_ENABLE_ADMIN_UI_V2",
    label: "Admin UI V2",
    description: "Future admin interface experiments.",
  },
  {
    key: "adminLivePreviewDisabled",
    envName: "NEXT_PUBLIC_DISABLE_ADMIN_LIVE_PREVIEW",
    label: "Disable Admin Live Preview",
    description: "Skips the heavy authenticated admin MobilePreview and shows a lightweight placeholder.",
  },
  {
    key: "buttonMenuV2Admin",
    envName: "NEXT_PUBLIC_ENABLE_BUTTON_MENU_V2_ADMIN",
    label: "Button/Menu V2 Admin Controls",
    description: "Enables Button/Menu System V2 controls in the admin link editor only.",
  },
  {
    key: "buttonMenuV2Preview",
    envName: "NEXT_PUBLIC_ENABLE_BUTTON_MENU_V2_PREVIEW",
    label: "Button/Menu V2 MobilePreview Rendering",
    description: "Enables Button/Menu System V2 rendering in the authenticated admin MobilePreview only.",
  },
  {
    key: "buttonMenuV2Public",
    envName: "NEXT_PUBLIC_ENABLE_BUTTON_MENU_V2_PUBLIC",
    label: "Button/Menu V2 Public Rendering",
    description: "Enables Button/Menu System V2 rendering on public profile pages only.",
  },
  {
    key: "formEngineV1",
    envName: "NEXT_PUBLIC_ENABLE_FORM_ENGINE_V1",
    label: "Form Engine V1",
    description: "Future form renderer and workflow experiments.",
  },
  {
    key: "uiLabMode",
    envName: "NEXT_PUBLIC_ENABLE_UI_LAB_MODE",
    label: "UI Lab Mode",
    description: "Enables the protected admin UI/UX lab page.",
  },
];
