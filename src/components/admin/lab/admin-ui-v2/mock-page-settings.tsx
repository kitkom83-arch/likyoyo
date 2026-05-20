import {
  CheckCircle2,
  Clock3,
  Eye,
  Globe2,
  ImageIcon,
  Save,
  Share2,
  ShieldOff,
  Smartphone,
  TriangleAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { pageLanguageOptions, pageStatusOptions, pageVisibilityOptions } from "./mock-data";
import { StaticField } from "./mock-links";
import {
  ChoiceGroup,
  MockInput,
  MockTextarea,
  MockToggle,
  MockValidationHints,
  PageStatusBadge,
} from "./mock-shared";
import type {
  MockLinkItem,
  PageLanguage,
  PageSettings,
  PageStatus,
  PageVisibility,
  UpdatePageSetting,
} from "./types";
import {
  getCanonicalPreview,
  getMockRoutePreview,
  getPageValidationItems,
  getSearchPreviewDescription,
  getSearchPreviewTitle,
  getSocialPreviewDescription,
  getSocialPreviewTitle,
} from "./mock-utils";

export function MockPageSettingsPanel({
  settings,
  validationHints,
  hasUnsavedChanges,
  onChange,
}: {
  settings: PageSettings;
  validationHints: string[];
  hasUnsavedChanges: boolean;
  onChange: UpdatePageSetting;
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Page Settings
          </p>
          <h3 className="mt-1 text-base font-semibold">Mock route and page controls</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Local component state only. These controls do not load routes, write schema, or save
            production page data.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <PageStatusBadge status={settings.status} />
          {hasUnsavedChanges ? <Badge variant="secondary">Unsaved mock changes</Badge> : null}
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)]">
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            <MockInput
              label="Page title"
              value={settings.pageTitle}
              onChange={(value) => onChange("pageTitle", value)}
            />
            <MockInput
              label="Public handle"
              value={settings.publicHandle}
              onChange={(value) => onChange("publicHandle", value)}
            />
            <MockInput
              label="Page slug"
              value={settings.slug}
              onChange={(value) => onChange("slug", value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ChoiceGroup
              label="Page status"
              options={pageStatusOptions}
              value={settings.status}
              onChange={(value) => onChange("status", value as PageStatus)}
            />
            <ChoiceGroup
              label="Visibility"
              options={pageVisibilityOptions}
              value={settings.visibility}
              onChange={(value) => onChange("visibility", value as PageVisibility)}
            />
            <ChoiceGroup
              label="Language"
              options={pageLanguageOptions}
              value={settings.language}
              onChange={(value) => onChange("language", value as PageLanguage)}
            />
            <ChoiceGroup
              label="Timezone"
              options={["Asia/Bangkok"]}
              value={settings.timezone}
              onChange={(value) => onChange("timezone", value as "Asia/Bangkok")}
            />
          </div>
        </div>

        <div className="grid gap-4">
          <StaticField label="Full mock route preview" value={getMockRoutePreview(settings)} />
          <StaticField label="Canonical URL preview" value={getCanonicalPreview(settings)} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Page validation hints
            </p>
            <div className="mt-2">
              <MockValidationHints hints={validationHints} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function MockSeoSocialPanel({
  settings,
  onChange,
}: {
  settings: PageSettings;
  onChange: UpdatePageSetting;
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            SEO / Social Share
          </p>
          <h3 className="mt-1 text-base font-semibold">Mock metadata fields</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            These fields update preview cards only. No metadata export, route update, or API call
            is created.
          </p>
        </div>
        <Badge variant="outline">no real SEO publishing</Badge>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="grid gap-4">
          <MockInput
            label="SEO title"
            value={settings.seoTitle}
            onChange={(value) => onChange("seoTitle", value)}
          />
          <MockTextarea
            label="SEO description"
            value={settings.seoDescription}
            onChange={(value) => onChange("seoDescription", value)}
          />
          <MockToggle
            label="Noindex toggle mock"
            checked={settings.noindex}
            onToggle={() => onChange("noindex", !settings.noindex)}
          />
        </div>

        <div className="grid gap-4">
          <MockInput
            label="Social preview title"
            value={settings.socialTitle}
            onChange={(value) => onChange("socialTitle", value)}
          />
          <MockTextarea
            label="Social preview description"
            value={settings.socialDescription}
            onChange={(value) => onChange("socialDescription", value)}
          />
          <MockInput
            label="Social image URL"
            value={settings.socialImageUrl}
            onChange={(value) => onChange("socialImageUrl", value)}
          />
        </div>
      </div>
    </section>
  );
}

export function MockSharePreviewCards({
  settings,
  selectedLink,
}: {
  settings: PageSettings;
  selectedLink: MockLinkItem;
}) {
  const routePreview = getMockRoutePreview(settings);
  const canonicalUrl = getCanonicalPreview(settings);

  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Share Preview Cards
          </p>
          <h3 className="mt-1 text-base font-semibold">Search, social, and mobile mocks</h3>
        </div>
        <Badge variant="outline">preview cards only</Badge>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <article className="min-w-0 rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <Globe2 className="size-4" />
            Browser/search preview
          </div>
          <p className="mt-4 break-words text-sm font-semibold leading-5 text-blue-700">
            {getSearchPreviewTitle(settings)}
          </p>
          <p className="mt-1 break-all text-xs leading-5 text-green-700">{canonicalUrl}</p>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {getSearchPreviewDescription(settings)}
          </p>
          {settings.noindex ? (
            <Badge variant="secondary" className="mt-3">
              <ShieldOff data-icon="inline-start" />
              noindex mock
            </Badge>
          ) : null}
        </article>

        <article className="min-w-0 overflow-hidden rounded-xl border bg-muted/30">
          <div className="grid aspect-[1.9/1] place-items-center bg-foreground text-background">
            {settings.socialImageUrl.trim() ? (
              <div className="max-w-full px-4 text-center">
                <ImageIcon className="mx-auto size-7" />
                <p className="mt-2 line-clamp-2 break-all text-xs">{settings.socialImageUrl}</p>
              </div>
            ) : (
              <div className="text-center">
                <ImageIcon className="mx-auto size-7" />
                <p className="mt-2 text-xs">optional image empty</p>
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <Share2 className="size-4" />
              Social share preview
            </div>
            <p className="mt-3 line-clamp-2 text-sm font-semibold leading-5">
              {getSocialPreviewTitle(settings)}
            </p>
            <p className="mt-1 line-clamp-3 text-xs leading-5 text-muted-foreground">
              {getSocialPreviewDescription(settings)}
            </p>
            <p className="mt-2 break-all text-xs text-muted-foreground">{routePreview}</p>
          </div>
        </article>

        <article className="rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <Smartphone className="size-4" />
            Mobile link preview
          </div>
          <div className="mx-auto mt-4 w-full max-w-[220px] rounded-3xl border bg-background p-2 shadow-sm">
            <div className="rounded-2xl bg-muted/40 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-semibold">{settings.publicHandle}</span>
                <PageStatusBadge status={settings.status} />
              </div>
              <div className="mt-3 rounded-xl border bg-background p-3 text-center">
                <p className="line-clamp-2 text-sm font-semibold leading-5">
                  {settings.pageTitle || "Untitled mock page"}
                </p>
                <p className="mt-1 break-all text-xs text-muted-foreground">{routePreview}</p>
              </div>
              <div className="mt-3 rounded-xl bg-foreground px-3 py-2 text-background">
                <p className="truncate text-xs font-semibold">{selectedLink.title}</p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-background/75">
                  {selectedLink.description}
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export function MockPublishFlow({
  settings,
  hasUnsavedChanges,
  publishFlowNote,
  onSaveDraft,
  onPreview,
  onPublish,
  onSchedule,
}: {
  settings: PageSettings;
  hasUnsavedChanges: boolean;
  publishFlowNote: string;
  onSaveDraft: () => void;
  onPreview: () => void;
  onPublish: () => void;
  onSchedule: () => void;
}) {
  const actions = [
    {
      label: "Save draft mock",
      detail: "Clears local dirty badge only",
      icon: Save,
      onClick: onSaveDraft,
    },
    {
      label: "Preview page mock",
      detail: "Updates this visual note only",
      icon: Eye,
      onClick: onPreview,
    },
    {
      label: "Publish mock",
      detail: "Sets local status badge only",
      icon: Share2,
      onClick: onPublish,
    },
    {
      label: "Schedule publish mock",
      detail: "Sets local scheduled badge only",
      icon: Clock3,
      onClick: onSchedule,
    },
  ];

  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Publish Flow
          </p>
          <h3 className="mt-1 text-base font-semibold">Safe visual controls</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            No save, no publish, no route loading, no schema update, and no API calls.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PageStatusBadge status={settings.status} />
          {hasUnsavedChanges ? <Badge variant="secondary">Unsaved mock changes</Badge> : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="min-w-0 rounded-lg border bg-muted/30 p-3 text-left transition-colors hover:bg-muted/60"
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Icon className="size-4" />
                {action.label}
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{action.detail}</p>
              <Badge variant="outline" className="mt-3">
                mock only
              </Badge>
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-lg border bg-muted/30 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Local action log
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{publishFlowNote}</p>
      </div>
    </section>
  );
}

export function MockPageValidationChecklist({
  settings,
  links,
  validationHints,
}: {
  settings: PageSettings;
  links: MockLinkItem[];
  validationHints: string[];
}) {
  const validationItems = getPageValidationItems(settings, links);
  const sampleHints = [
    "invalid slug sample",
    "empty title",
    "hidden page",
    "scheduled page",
    "locked page",
  ];

  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Publish Checklist
          </p>
          <h3 className="mt-1 text-base font-semibold">Mock validation only</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Checklist states are hints for the prototype and do not block any local mock action.
          </p>
        </div>
        <Badge variant="outline">no real validation blocking</Badge>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {validationItems.map((item) => (
          <div key={item.label} className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-start gap-2">
              {item.ready ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              ) : (
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-5">{item.label}</p>
                <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">
                  {item.detail}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.6fr)]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Active visual hints
          </p>
          <div className="mt-2">
            <MockValidationHints hints={validationHints} />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Hint examples
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sampleHints.map((hint) => (
              <Badge key={hint} variant="outline">
                <TriangleAlert data-icon="inline-start" />
                {hint}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
