const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

const readPublicBooleanFlag = (name: string): boolean => {
  const value = process.env[name];
  return typeof value === "string" && TRUE_VALUES.has(value.trim().toLowerCase());
};

export const featureFlags = {
  publicResponsiveV2: readPublicBooleanFlag("NEXT_PUBLIC_ENABLE_PUBLIC_RESPONSIVE_V2"),
  adminUiV2: readPublicBooleanFlag("NEXT_PUBLIC_ENABLE_ADMIN_UI_V2"),
  formEngineV1: readPublicBooleanFlag("NEXT_PUBLIC_ENABLE_FORM_ENGINE_V1"),
  uiLabMode: readPublicBooleanFlag("NEXT_PUBLIC_ENABLE_UI_LAB_MODE"),
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
