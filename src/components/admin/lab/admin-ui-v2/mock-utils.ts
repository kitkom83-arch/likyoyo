import type {
  ButtonStyle,
  FormFieldType,
  MockFormField,
  MockFormTemplate,
  MockLinkItem,
  MockSubmissionRouting,
  PageSettings,
  TextAlign,
} from "./types";
import { buttonStyles, mockToday, productionOrigin } from "./mock-data";

export const getStatusLabel = (value: string) => {
  if (value === "active") return "active";
  if (value === "enabled") return "enabled";
  return value;
};

export const getStyleLabel = (style: ButtonStyle) =>
  buttonStyles.find((item) => item.id === style)?.label ?? style;

export const getLinkStatusLabel = (link: MockLinkItem) => (link.enabled ? "enabled" : "disabled");

export const getLinkActionLabel = (link: MockLinkItem) => link.url.trim() || link.actionLabel;

export const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

export const getPercentWidth = (value: number, max = 100) => `${Math.max(4, Math.min(100, (value / max) * 100))}%`;

export const isSlugValid = (slug: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim());

export const normalizeRouteSegment = (value: string, fallback: string) => {
  const trimmed = value.trim().replace(/^\/+|\/+$/g, "");
  return trimmed || fallback;
};

export const getMockRoutePreview = (settings: PageSettings) => {
  const handle = normalizeRouteSegment(settings.publicHandle, "bn9");
  const slug = normalizeRouteSegment(settings.slug, "untitled");

  return `/${handle}/${slug}`;
};

export const getCanonicalPreview = (settings: PageSettings) =>
  `${productionOrigin}${getMockRoutePreview(settings)}`;

export const getSearchPreviewTitle = (settings: PageSettings) =>
  settings.seoTitle.trim() || settings.pageTitle.trim() || "Untitled mock page";

export const getSearchPreviewDescription = (settings: PageSettings) =>
  settings.seoDescription.trim() || "SEO description preview is empty in this mock state.";

export const getSocialPreviewTitle = (settings: PageSettings) =>
  settings.socialTitle.trim() || settings.pageTitle.trim() || "Untitled social preview";

export const getSocialPreviewDescription = (settings: PageSettings) =>
  settings.socialDescription.trim() || settings.seoDescription.trim() || "Social description is empty.";

export const getPageValidationHints = (settings: PageSettings) => {
  const hints: string[] = [];

  if (!settings.pageTitle.trim()) {
    hints.push("empty title");
  }

  if (!isSlugValid(settings.slug)) {
    hints.push("invalid slug sample");
  }

  if (settings.visibility === "Hidden") {
    hints.push("hidden page");
  }

  if (settings.status === "Scheduled") {
    hints.push("scheduled page");
  }

  if (settings.visibility === "Password protected") {
    hints.push("locked page");
  }

  if (settings.noindex) {
    hints.push("noindex enabled");
  }

  return hints;
};

export const getPageValidationItems = (settings: PageSettings, links: MockLinkItem[]) => {
  const enabledLinks = links.filter((link) => link.enabled).length;

  return [
    {
      label: "Page title exists",
      ready: Boolean(settings.pageTitle.trim()),
      detail: settings.pageTitle.trim() ? "Title is present" : "empty title",
    },
    {
      label: "Slug looks valid",
      ready: isSlugValid(settings.slug),
      detail: isSlugValid(settings.slug)
        ? getMockRoutePreview(settings)
        : "invalid slug sample: use lowercase words with hyphens",
    },
    {
      label: "At least one enabled link",
      ready: enabledLinks > 0,
      detail: `${enabledLinks} enabled mock links`,
    },
    {
      label: "SEO description exists",
      ready: Boolean(settings.seoDescription.trim()),
      detail: settings.seoDescription.trim() ? "Search preview has body copy" : "description empty",
    },
    {
      label: "Social image optional",
      ready: true,
      detail: settings.socialImageUrl.trim() ? "Image URL set" : "optional empty state",
    },
  ];
};

export const getFormStatusLabel = (form: MockFormTemplate) => (form.enabled ? "enabled" : "disabled");

export const requiresOptions = (type: FormFieldType) =>
  type === "select" || type === "radio" || type === "checkbox";

export const getFormValidationHints = (
  form: MockFormTemplate,
  fields: MockFormField[],
  routing: MockSubmissionRouting
) => {
  const hints: string[] = [];
  const enabledFields = fields.filter((field) => field.enabled);

  if (enabledFields.some((field) => !field.label.trim())) {
    hints.push("empty field label");
  }

  if (!enabledFields.length) {
    hints.push("no enabled fields");
  }

  if (!routing.destination) {
    hints.push("missing destination");
  }

  if (!form.enabled) {
    hints.push("disabled form");
  }

  return hints;
};

export const getFormValidationItems = (
  form: MockFormTemplate,
  fields: MockFormField[],
  routing: MockSubmissionRouting
) => {
  const enabledFields = fields.filter((field) => field.enabled);
  const requiredFields = fields.filter((field) => field.required);
  const requiredFieldsHaveLabels = requiredFields.every((field) => field.label.trim());

  return [
    {
      label: "Form title exists",
      ready: Boolean(form.title.trim()),
      detail: form.title.trim() ? form.title : "form title missing",
    },
    {
      label: "At least one enabled field",
      ready: enabledFields.length > 0,
      detail: `${enabledFields.length} enabled mock fields`,
    },
    {
      label: "Required fields have labels",
      ready: requiredFieldsHaveLabels,
      detail: requiredFieldsHaveLabels ? `${requiredFields.length} required fields named` : "empty field label",
    },
    {
      label: "Destination selected",
      ready: Boolean(routing.destination),
      detail: routing.destination || "missing destination",
    },
    {
      label: "Privacy note exists",
      ready: Boolean(form.privacyNote.trim()),
      detail: form.privacyNote.trim() ? "Privacy note present" : "privacy note missing",
    },
  ];
};

export const getMockSubmissionStatus = (form: MockFormTemplate) =>
  form.enabled ? "received mock" : "paused mock";

export const getValidationHints = (link: MockLinkItem) => {
  const hints: string[] = [];
  const trimmedUrl = link.url.trim();

  if (!trimmedUrl) {
    hints.push("empty URL");
  } else if (!/^https?:\/\/[^\s]+$/i.test(trimmedUrl)) {
    hints.push("invalid URL sample");
  }

  if (!link.enabled) {
    hints.push("disabled link");
  }

  if (link.scheduleHideDate && link.scheduleHideDate <= mockToday) {
    hints.push("scheduled hidden");
  }

  if (link.lockType !== "none") {
    hints.push("locked link");
  }

  return hints;
};

export const getAlignClass = (alignment: TextAlign) => {
  if (alignment === "center") return "text-center";
  if (alignment === "right") return "text-right";
  return "text-left";
};

export const getJustifyClass = (alignment: TextAlign) => {
  if (alignment === "center") return "justify-center";
  if (alignment === "right") return "justify-end";
  return "justify-start";
};
