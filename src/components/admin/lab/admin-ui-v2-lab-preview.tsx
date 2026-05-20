"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Blocks,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Eye,
  ExternalLink,
  FileText,
  FormInput,
  Globe2,
  ImageIcon,
  LockKeyhole,
  Monitor,
  MousePointerClick,
  Palette,
  PanelRight,
  Save,
  Settings,
  ShieldCheck,
  ShieldOff,
  Share2,
  Smartphone,
  Star,
  TriangleAlert,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type DeviceMode = "phone" | "desktop";
type ButtonStyle = "icon-left" | "image-full" | "text-only" | "card-left-image" | "text-panel";
type TextAlign = "left" | "center" | "right";
type LockType = "none" | "code" | "age" | "sensitive";

type MockPage = {
  route: string;
  title: string;
  status: "active" | "draft" | "mock";
  detail: string;
  headline: string;
  previewNote: string;
};

type PageStatus = "Draft" | "Published" | "Scheduled";
type PageVisibility = "Public" | "Hidden" | "Password protected";
type PageLanguage = "Thai" | "English";

type PageSettings = {
  pageTitle: string;
  publicHandle: string;
  slug: string;
  status: PageStatus;
  visibility: PageVisibility;
  language: PageLanguage;
  timezone: "Asia/Bangkok";
  seoTitle: string;
  seoDescription: string;
  socialTitle: string;
  socialDescription: string;
  socialImageUrl: string;
  noindex: boolean;
};

type MockBlock = {
  id: string;
  label: string;
  state: "enabled" | "disabled";
  detail: string;
  previewTitle: string;
  previewBody: string;
  controls: string[];
};

type MockLinkItem = {
  id: string;
  title: string;
  description: string;
  body: string;
  url: string;
  actionLabel: string;
  enabled: boolean;
  prioritized: boolean;
  openInNewTab: boolean;
  buttonStyle: ButtonStyle;
  textAlignment: TextAlign;
  imageUrl: string;
  backgroundImageUrl: string;
  schedulePublishDate: string;
  scheduleHideDate: string;
  lockType: LockType;
  totalClicks: number;
  sevenDayClicks: number;
  ctr: string;
};

type DesignSettings = {
  theme: string;
  buttonStyle: ButtonStyle;
  radius: string;
  textAlignment: TextAlign;
  imageSourceMode: string;
  border: string;
  shadow: string;
  spacing: string;
  density: string;
  imageUrl: string;
  backgroundImageUrl: string;
  aspectRatio: "3:1" | "2:1";
  overlayOpacity: number;
  textOverlay: boolean;
  fontWeight: string;
  title: string;
  description: string;
  body: string;
};

type UpdateDesignSetting = <K extends keyof DesignSettings>(
  key: K,
  value: DesignSettings[K]
) => void;

type UpdateSelectedLink = <K extends keyof MockLinkItem>(
  key: K,
  value: MockLinkItem[K]
) => void;

type UpdatePageSetting = <K extends keyof PageSettings>(
  key: K,
  value: PageSettings[K]
) => void;

const adminNavItems = [
  { label: "Pages", icon: FileText, active: true },
  { label: "Blocks", icon: Blocks, active: false },
  { label: "Design", icon: Palette, active: false },
  { label: "Forms", icon: FormInput, active: false },
  { label: "Analytics", icon: BarChart3, active: false },
  { label: "Settings", icon: Settings, active: false },
];

const mockPages: MockPage[] = [
  {
    route: "/bn9/main",
    title: "Main landing",
    status: "active",
    detail: "Hero, offers, contact",
    headline: "Northfield Studio main experience",
    previewNote: "Primary public landing concept with hero and high-intent CTAs.",
  },
  {
    route: "/bn9/promo",
    title: "Promo page",
    status: "draft",
    detail: "Seasonal campaign",
    headline: "Limited campaign page",
    previewNote: "Focused promo flow with image-forward offers and urgency blocks.",
  },
  {
    route: "/bn9/support",
    title: "Support page",
    status: "mock",
    detail: "Static support concept",
    headline: "Support request hub",
    previewNote: "Mock support layout only; no deposit, withdraw, or ticket routes.",
  },
];

const initialPageSettingsByRoute: Record<string, PageSettings> = {
  "/bn9/main": {
    pageTitle: "Northfield Studio main experience",
    publicHandle: "bn9",
    slug: "main",
    status: "Published",
    visibility: "Public",
    language: "English",
    timezone: "Asia/Bangkok",
    seoTitle: "Northfield Studio | Main Links",
    seoDescription:
      "Book consultations, view VIP menu, and open current support links from the BN9 main page.",
    socialTitle: "Northfield Studio main links",
    socialDescription: "Fast access to consultation, VIP offers, and support resources.",
    socialImageUrl: "https://support.bn9.one/mock-share/main.jpg",
    noindex: false,
  },
  "/bn9/promo": {
    pageTitle: "Limited campaign page",
    publicHandle: "bn9",
    slug: "promo",
    status: "Draft",
    visibility: "Hidden",
    language: "Thai",
    timezone: "Asia/Bangkok",
    seoTitle: "BN9 Promo | Limited Campaign",
    seoDescription:
      "A draft campaign page preview for limited offers, visual-only urgency blocks, and seasonal CTAs.",
    socialTitle: "Limited campaign preview",
    socialDescription: "Preview the mock promo flow before any real route or publishing exists.",
    socialImageUrl: "https://support.bn9.one/mock-share/promo.jpg",
    noindex: true,
  },
  "/bn9/support": {
    pageTitle: "Support request hub",
    publicHandle: "bn9",
    slug: "support",
    status: "Scheduled",
    visibility: "Password protected",
    language: "English",
    timezone: "Asia/Bangkok",
    seoTitle: "BN9 Support Hub",
    seoDescription:
      "Visual-only support hub preview with safe mock status, locked access styling, and no ticket routes.",
    socialTitle: "Support request hub",
    socialDescription: "A protected mock support preview for future account and help actions.",
    socialImageUrl: "",
    noindex: true,
  },
};

const mockBlocks: MockBlock[] = [
  {
    id: "hero",
    label: "Hero Header",
    state: "enabled",
    detail: "Brand intro and avatar",
    previewTitle: "Hero Header",
    previewBody: "Brand avatar, page headline, short intro, and primary action area.",
    controls: ["Avatar style", "Headline size", "Hero media", "Intro alignment"],
  },
  {
    id: "buttons",
    label: "Button Group",
    state: "enabled",
    detail: "Primary links and CTAs",
    previewTitle: "Button Group",
    previewBody: "Stacked action buttons with icon, image, and text variants.",
    controls: ["Button density", "Icon placement", "Priority order", "Corner radius"],
  },
  {
    id: "form",
    label: "Form Block",
    state: "disabled",
    detail: "No endpoint wiring",
    previewTitle: "Form Block",
    previewBody: "Static form layout preview without submissions or API calls.",
    controls: ["Field spacing", "Required labels", "Submit copy", "Success state"],
  },
  {
    id: "embed",
    label: "Embed Post",
    state: "enabled",
    detail: "Static content preview",
    previewTitle: "Embed Post",
    previewBody: "Rich content slot for visual posts, announcements, or video embeds.",
    controls: ["Aspect ratio", "Caption style", "Media frame", "Content source"],
  },
  {
    id: "analytics",
    label: "Analytics Card",
    state: "disabled",
    detail: "Mock metrics only",
    previewTitle: "Analytics Card",
    previewBody: "Future private insight card with sample views, clicks, and CTR.",
    controls: ["Metric set", "Chart style", "Date range", "Privacy mode"],
  },
];

const initialMockLinks: MockLinkItem[] = [
  {
    id: "book-consultation",
    title: "Book a Consultation",
    description: "Fast path for high-intent visitors who want a guided setup call.",
    body: "Choose a time with the studio team.\nConfirmation details stay in this mock only.",
    url: "https://support.bn9.one/consultation",
    actionLabel: "Open booking mock",
    enabled: true,
    prioritized: true,
    openInNewTab: true,
    buttonStyle: "icon-left",
    textAlignment: "left",
    imageUrl: "https://images.example/mock-consultation-icon.png",
    backgroundImageUrl: "https://images.example/mock-consultation-cover.jpg",
    schedulePublishDate: "2026-05-20",
    scheduleHideDate: "",
    lockType: "none",
    totalClicks: 1284,
    sevenDayClicks: 132,
    ctr: "12.4%",
  },
  {
    id: "vip-menu",
    title: "VIP Menu",
    description: "Image-forward menu concept for premium offers and private options.",
    body: "VIP members can scan current packages.\nThis is visual-only menu copy.",
    url: "https://support.bn9.one/vip",
    actionLabel: "Open VIP menu mock",
    enabled: true,
    prioritized: false,
    openInNewTab: false,
    buttonStyle: "image-full",
    textAlignment: "center",
    imageUrl: "https://images.example/mock-vip-icon.png",
    backgroundImageUrl: "https://images.example/mock-vip-cover.jpg",
    schedulePublishDate: "2026-05-22",
    scheduleHideDate: "",
    lockType: "age",
    totalClicks: 942,
    sevenDayClicks: 88,
    ctr: "10.1%",
  },
  {
    id: "support-request",
    title: "Support Request",
    description: "Private support flow concept with code-gated access.",
    body: "Describe the support need.\nA future version can route this into a real queue.",
    url: "support-request",
    actionLabel: "Open support mock",
    enabled: true,
    prioritized: false,
    openInNewTab: false,
    buttonStyle: "card-left-image",
    textAlignment: "left",
    imageUrl: "https://images.example/mock-support-icon.png",
    backgroundImageUrl: "https://images.example/mock-support-cover.jpg",
    schedulePublishDate: "2026-05-19",
    scheduleHideDate: "",
    lockType: "code",
    totalClicks: 603,
    sevenDayClicks: 47,
    ctr: "8.7%",
  },
  {
    id: "promo-banner",
    title: "Promo Banner",
    description: "Disabled banner draft with an intentionally empty URL state.",
    body: "Promo copy can sit here before a campaign URL exists.",
    url: "",
    actionLabel: "No URL set",
    enabled: false,
    prioritized: false,
    openInNewTab: false,
    buttonStyle: "text-only",
    textAlignment: "center",
    imageUrl: "https://images.example/mock-promo-icon.png",
    backgroundImageUrl: "https://images.example/mock-promo-cover.jpg",
    schedulePublishDate: "2026-05-10",
    scheduleHideDate: "2026-05-18",
    lockType: "none",
    totalClicks: 217,
    sevenDayClicks: 0,
    ctr: "0.0%",
  },
  {
    id: "announcement-panel",
    title: "Announcement Panel",
    description: "Long-form panel for updates that need multiple lines of context.",
    body: "Line one: service hours update.\nLine two: support response windows.\nLine three: follow the latest notice.",
    url: "https://support.bn9.one/announcements",
    actionLabel: "Read announcement mock",
    enabled: true,
    prioritized: false,
    openInNewTab: true,
    buttonStyle: "text-panel",
    textAlignment: "left",
    imageUrl: "https://images.example/mock-announcement-icon.png",
    backgroundImageUrl: "https://images.example/mock-announcement-cover.jpg",
    schedulePublishDate: "2026-05-21",
    scheduleHideDate: "",
    lockType: "sensitive",
    totalClicks: 451,
    sevenDayClicks: 71,
    ctr: "9.8%",
  },
];

const buttonStyles: Array<{
  id: ButtonStyle;
  label: string;
  detail: string;
}> = [
  { id: "icon-left", label: "Icon left", detail: "Circular media with CTA text" },
  { id: "image-full", label: "Image full", detail: "Image-led button with overlay" },
  { id: "text-only", label: "Text only", detail: "Minimal typography button" },
  { id: "card-left-image", label: "Card left image", detail: "Compact card with media rail" },
  { id: "text-panel", label: "Text panel", detail: "Paragraph-first content panel" },
];

const defaultDesignSettings: DesignSettings = {
  theme: "Studio Light",
  buttonStyle: "icon-left",
  radius: "14px",
  textAlignment: "left",
  imageSourceMode: "URL field",
  border: "Soft border",
  shadow: "Low shadow",
  spacing: "Comfortable",
  density: "Balanced",
  imageUrl: "https://images.example/mock-icon.png",
  backgroundImageUrl: "https://images.example/mock-cover.jpg",
  aspectRatio: "3:1",
  overlayOpacity: 42,
  textOverlay: true,
  fontWeight: "Semibold",
  title: "Priority support",
  description: "Fast access to the current help flow and account actions.",
  body: "Use this panel for longer menu copy.\nLine breaks stay visible in the preview.",
};

const safeLabels = [
  "local mock state only",
  "no save",
  "no publish",
  "no schema update",
  "no route loading",
  "no API calls",
];

const alignOptions: TextAlign[] = ["left", "center", "right"];
const lockTypeOptions: LockType[] = ["none", "code", "age", "sensitive"];
const pageStatusOptions: PageStatus[] = ["Draft", "Published", "Scheduled"];
const pageVisibilityOptions: PageVisibility[] = ["Public", "Hidden", "Password protected"];
const pageLanguageOptions: PageLanguage[] = ["Thai", "English"];
const mockToday = "2026-05-20";
const productionOrigin = "https://support.bn9.one";

const getStatusLabel = (value: string) => {
  if (value === "active") return "active";
  if (value === "enabled") return "enabled";
  return value;
};

const getStyleLabel = (style: ButtonStyle) =>
  buttonStyles.find((item) => item.id === style)?.label ?? style;

const getLinkStatusLabel = (link: MockLinkItem) => (link.enabled ? "enabled" : "disabled");

const getLinkActionLabel = (link: MockLinkItem) => link.url.trim() || link.actionLabel;

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

const isSlugValid = (slug: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim());

const normalizeRouteSegment = (value: string, fallback: string) => {
  const trimmed = value.trim().replace(/^\/+|\/+$/g, "");
  return trimmed || fallback;
};

const getMockRoutePreview = (settings: PageSettings) => {
  const handle = normalizeRouteSegment(settings.publicHandle, "bn9");
  const slug = normalizeRouteSegment(settings.slug, "untitled");

  return `/${handle}/${slug}`;
};

const getCanonicalPreview = (settings: PageSettings) =>
  `${productionOrigin}${getMockRoutePreview(settings)}`;

const getSearchPreviewTitle = (settings: PageSettings) =>
  settings.seoTitle.trim() || settings.pageTitle.trim() || "Untitled mock page";

const getSearchPreviewDescription = (settings: PageSettings) =>
  settings.seoDescription.trim() || "SEO description preview is empty in this mock state.";

const getSocialPreviewTitle = (settings: PageSettings) =>
  settings.socialTitle.trim() || settings.pageTitle.trim() || "Untitled social preview";

const getSocialPreviewDescription = (settings: PageSettings) =>
  settings.socialDescription.trim() || settings.seoDescription.trim() || "Social description is empty.";

const getPageValidationHints = (settings: PageSettings) => {
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

const getPageValidationItems = (settings: PageSettings, links: MockLinkItem[]) => {
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

const getValidationHints = (link: MockLinkItem) => {
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

const getAlignClass = (alignment: TextAlign) => {
  if (alignment === "center") return "text-center";
  if (alignment === "right") return "text-right";
  return "text-left";
};

const getJustifyClass = (alignment: TextAlign) => {
  if (alignment === "center") return "justify-center";
  if (alignment === "right") return "justify-end";
  return "justify-start";
};

function StatusBadge({ value }: { value: string }) {
  if (value === "active" || value === "enabled") {
    return <Badge>{getStatusLabel(value)}</Badge>;
  }

  if (value === "draft") {
    return <Badge variant="outline">draft</Badge>;
  }

  return <Badge variant="secondary">{value}</Badge>;
}

function PageStatusBadge({ status }: { status: PageStatus }) {
  if (status === "Published") {
    return <Badge>{status}</Badge>;
  }

  if (status === "Scheduled") {
    return <Badge variant="secondary">{status}</Badge>;
  }

  return <Badge variant="outline">{status}</Badge>;
}

function SafetyLabelRow() {
  return (
    <div className="flex flex-wrap gap-2">
      {safeLabels.map((label) => (
        <Badge key={label} variant="outline">
          {label}
        </Badge>
      ))}
    </div>
  );
}

function MockTopBar({
  selectedPage,
  pageSettings,
  selectedLink,
  deviceMode,
  selectedStyle,
  hasUnsavedChanges,
}: {
  selectedPage: MockPage;
  pageSettings: PageSettings;
  selectedLink: MockLinkItem;
  deviceMode: DeviceMode;
  selectedStyle: ButtonStyle;
  hasUnsavedChanges: boolean;
}) {
  const DeviceIcon = deviceMode === "phone" ? Smartphone : Monitor;

  return (
    <header className="border-b bg-background px-4 py-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Current mock page route
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold leading-tight">{getMockRoutePreview(pageSettings)}</h3>
            <Badge variant="outline">no real route loading</Badge>
            <PageStatusBadge status={pageSettings.status} />
            {hasUnsavedChanges ? <Badge variant="secondary">Unsaved mock changes</Badge> : null}
            <Badge variant="secondary">{getStyleLabel(selectedStyle)}</Badge>
            <Badge variant="outline">{selectedLink.title}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Selected static lab route: {selectedPage.route}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Mock save status: idle</Badge>
          <Badge variant="outline">
            <DeviceIcon data-icon="inline-start" />
            {deviceMode === "phone" ? "Phone mode" : "Desktop mode"}
          </Badge>
          <Badge variant="outline">
            <ShieldCheck data-icon="inline-start" />
            Safe mock mode
          </Badge>
        </div>
      </div>
    </header>
  );
}

function MockSidebar() {
  return (
    <aside className="border-b bg-background p-4 lg:border-b-0 lg:border-r">
      <div className="rounded-lg border bg-muted/40 px-3 py-3">
        <p className="text-sm font-semibold">Likyoyo Studio</p>
        <p className="mt-1 text-xs text-muted-foreground">Backoffice concept</p>
      </div>
      <nav className="mt-4 grid gap-2" aria-label="Mock admin navigation">
        {adminNavItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                item.active ? "bg-foreground text-background" : "bg-muted/50 text-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </div>
          );
        })}
      </nav>
      <div className="mt-5 rounded-lg border p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Guardrails
        </p>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Visual-only lab shell with local mock state. No save, publish, schema, route, or
          store updates.
        </p>
      </div>
    </aside>
  );
}

function MockPagesArea({
  selectedPage,
  pageSettingsByRoute,
  dirtyRoutes,
  onSelectPage,
}: {
  selectedPage: MockPage;
  pageSettingsByRoute: Record<string, PageSettings>;
  dirtyRoutes: Record<string, boolean>;
  onSelectPage: (page: MockPage) => void;
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Pages
          </p>
          <h3 className="mt-1 text-base font-semibold">Mock page map</h3>
        </div>
        <Badge variant="secondary">static routes</Badge>
      </div>
      <div className="mt-4 grid gap-3">
        {mockPages.map((page) => {
          const selected = selectedPage.route === page.route;
          const pageSettings = pageSettingsByRoute[page.route];

          return (
            <button
              key={page.route}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelectPage(page)}
              className={cn(
                "rounded-lg border p-3 text-left transition-colors",
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "bg-muted/30 hover:bg-muted/60"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{page.route}</p>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      selected ? "text-background/75" : "text-muted-foreground"
                    )}
                  >
                    {page.title}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-2">
                  {dirtyRoutes[page.route] ? (
                    <Badge variant={selected ? "secondary" : "outline"}>unsaved</Badge>
                  ) : null}
                  {pageSettings ? (
                    <PageStatusBadge status={pageSettings.status} />
                  ) : (
                    <StatusBadge value={page.status} />
                  )}
                </div>
              </div>
              <p
                className={cn(
                  "mt-2 text-xs leading-5",
                  selected ? "text-background/75" : "text-muted-foreground"
                )}
              >
                {page.detail}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function MockBlockManager({
  selectedBlock,
  onSelectBlock,
}: {
  selectedBlock: MockBlock;
  onSelectBlock: (block: MockBlock) => void;
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Block Manager
          </p>
          <h3 className="mt-1 text-base font-semibold">Mock block stack</h3>
        </div>
        <Badge variant="outline">no schema changes</Badge>
      </div>
      <div className="mt-4 grid gap-3">
        {mockBlocks.map((block) => {
          const selected = selectedBlock.id === block.id;

          return (
            <button
              key={block.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelectBlock(block)}
              className={cn(
                "rounded-lg border p-3 text-left transition-colors",
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "bg-muted/30 hover:bg-muted/60"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{block.label}</p>
                  <p
                    className={cn(
                      "mt-1 text-xs leading-5",
                      selected ? "text-background/75" : "text-muted-foreground"
                    )}
                  >
                    {block.detail}
                  </p>
                </div>
                <StatusBadge value={block.state} />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function MockValidationHints({ hints }: { hints: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {hints.length ? (
        hints.map((hint) => (
          <Badge key={hint} variant="secondary">
            <TriangleAlert data-icon="inline-start" />
            {hint}
          </Badge>
        ))
      ) : (
        <Badge variant="outline">no visual validation hints</Badge>
      )}
    </div>
  );
}

function MockStatsGrid({ link }: { link: MockLinkItem }) {
  const stats = [
    { label: "Total clicks", value: formatNumber(link.totalClicks) },
    { label: "7 day clicks", value: formatNumber(link.sevenDayClicks) },
    { label: "CTR", value: link.ctr },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg border bg-muted/30 p-3">
          <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
          <p className="mt-1 text-lg font-semibold leading-tight">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

function MockLinkManager({
  links,
  selectedLink,
  onSelectLink,
  onMoveLink,
}: {
  links: MockLinkItem[];
  selectedLink: MockLinkItem;
  onSelectLink: (linkId: string) => void;
  onMoveLink: (linkId: string, direction: -1 | 1) => void;
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Link Manager
          </p>
          <h3 className="mt-1 text-base font-semibold">Mock link stack</h3>
        </div>
        <Badge variant="outline">local reorder only</Badge>
      </div>

      <div className="mt-4 grid gap-3">
        {links.map((link, index) => {
          const selected = selectedLink.id === link.id;
          const first = index === 0;
          const last = index === links.length - 1;

          return (
            <div
              key={link.id}
              className={cn(
                "flex min-w-0 gap-2 rounded-lg border p-2 transition-colors",
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "bg-muted/30 hover:bg-muted/60"
              )}
            >
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onSelectLink(link.id)}
                className="min-w-0 flex-1 rounded-md p-1 text-left"
              >
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold">{link.title}</p>
                      {link.prioritized ? (
                        <Badge variant={selected ? "secondary" : "outline"}>
                          <Star data-icon="inline-start" />
                          prioritized
                        </Badge>
                      ) : null}
                    </div>
                    <p
                      className={cn(
                        "mt-1 truncate text-xs",
                        selected ? "text-background/75" : "text-muted-foreground"
                      )}
                    >
                      {getLinkActionLabel(link)}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <StatusBadge value={getLinkStatusLabel(link)} />
                    <Badge variant={selected ? "secondary" : "outline"}>
                      {getStyleLabel(link.buttonStyle)}
                    </Badge>
                    <Badge variant={selected ? "secondary" : "outline"}>
                      <MousePointerClick data-icon="inline-start" />
                      {formatNumber(link.totalClicks)}
                    </Badge>
                  </div>
                </div>
              </button>

              <div className="grid shrink-0 grid-cols-2 gap-1 sm:grid-cols-1">
                <button
                  type="button"
                  onClick={() => onMoveLink(link.id, -1)}
                  disabled={first}
                  title="Move up"
                  className="grid size-8 place-items-center rounded-md border bg-background/80 text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowUp className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onMoveLink(link.id, 1)}
                  disabled={last}
                  title="Move down"
                  className="grid size-8 place-items-center rounded-md border bg-background/80 text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowDown className="size-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ChoiceGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option;

          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option)}
              className={cn(
                "min-h-8 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "bg-muted/30 hover:bg-muted/60"
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AlignmentChoice({
  value,
  onChange,
}: {
  value: TextAlign;
  onChange: (value: TextAlign) => void;
}) {
  const icons = {
    left: AlignLeft,
    center: AlignCenter,
    right: AlignRight,
  };

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">Text alignment</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {alignOptions.map((option) => {
          const Icon = icons[option];
          const selected = value === option;

          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option)}
              className={cn(
                "flex h-9 items-center justify-center rounded-lg border transition-colors",
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "bg-muted/30 hover:bg-muted/60"
              )}
              title={option}
            >
              <Icon className="size-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MockInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full min-w-0 rounded-lg border bg-muted/30 px-3 text-sm outline-none transition-colors focus:border-foreground"
      />
    </label>
  );
}

function MockTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="mt-2 w-full min-w-0 resize-none rounded-lg border bg-muted/30 px-3 py-2 text-sm leading-6 outline-none transition-colors focus:border-foreground"
      />
    </label>
  );
}

function MockToggle({
  label,
  checked = false,
  onToggle,
}: {
  label: string;
  checked?: boolean;
  onToggle?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3 text-left"
    >
      <span className="text-sm font-medium">{label}</span>
      <span
        className={cn(
          "flex h-6 w-11 items-center rounded-full p-1",
          checked ? "justify-end bg-foreground" : "justify-start bg-muted"
        )}
      >
        <span className="size-4 rounded-full bg-background shadow-sm" />
      </span>
    </button>
  );
}

function MockPageSettingsPanel({
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

function MockSeoSocialPanel({
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

function MockSharePreviewCards({
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

function MockPublishFlow({
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

function MockPageValidationChecklist({
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

function PerLinkSettingsPanel({
  link,
  settings,
  validationHints,
  onLinkChange,
  onSettingChange,
  onTogglePrioritized,
}: {
  link: MockLinkItem;
  settings: DesignSettings;
  validationHints: string[];
  onLinkChange: UpdateSelectedLink;
  onSettingChange: UpdateDesignSetting;
  onTogglePrioritized: () => void;
}) {
  return (
    <div className="grid gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Visual validation
        </p>
        <div className="mt-2">
          <MockValidationHints hints={validationHints} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MockInput
          label="Title"
          value={link.title}
          onChange={(value) => onLinkChange("title", value)}
        />
        <MockInput
          label="URL"
          value={link.url}
          onChange={(value) => onLinkChange("url", value)}
        />
      </div>

      <MockTextarea
        label="Description"
        value={link.description}
        onChange={(value) => onLinkChange("description", value)}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <MockToggle
          label="Open in new tab"
          checked={link.openInNewTab}
          onToggle={() => onLinkChange("openInNewTab", !link.openInNewTab)}
        />
        <MockToggle
          label="Enabled"
          checked={link.enabled}
          onToggle={() => onLinkChange("enabled", !link.enabled)}
        />
        <MockToggle
          label="Featured / Prioritized"
          checked={link.prioritized}
          onToggle={onTogglePrioritized}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ChoiceGroup
          label="Button style"
          options={buttonStyles.map((style) => style.id)}
          value={link.buttonStyle}
          onChange={(value) => onLinkChange("buttonStyle", value as ButtonStyle)}
        />
        <AlignmentChoice
          value={link.textAlignment}
          onChange={(value) => onLinkChange("textAlignment", value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MockInput
          label="Image URL"
          value={link.imageUrl}
          onChange={(value) => onLinkChange("imageUrl", value)}
        />
        <MockInput
          label="Background Image URL"
          value={link.backgroundImageUrl}
          onChange={(value) => onLinkChange("backgroundImageUrl", value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MockInput
          label="Schedule publish date"
          value={link.schedulePublishDate}
          onChange={(value) => onLinkChange("schedulePublishDate", value)}
        />
        <MockInput
          label="Schedule hide date"
          value={link.scheduleHideDate}
          onChange={(value) => onLinkChange("scheduleHideDate", value)}
        />
      </div>

      <ChoiceGroup
        label="Lock type"
        options={lockTypeOptions}
        value={link.lockType}
        onChange={(value) => onLinkChange("lockType", value as LockType)}
      />

      {link.buttonStyle === "text-panel" ? (
        <MockTextarea
          label="Text panel body"
          value={link.body}
          onChange={(value) => onLinkChange("body", value)}
        />
      ) : null}

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Style-specific mock fields
        </p>
        <div className="mt-3">
          <StyleSpecificFields settings={settings} onChange={onSettingChange} />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Mock click stats
        </p>
        <div className="mt-3">
          <MockStatsGrid link={link} />
        </div>
      </div>
    </div>
  );
}

function ButtonStyleSelector({
  value,
  onChange,
}: {
  value: ButtonStyle;
  onChange: (value: ButtonStyle) => void;
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Button/Menu Style
          </p>
          <h3 className="mt-1 text-base font-semibold">Mock selector</h3>
        </div>
        <Badge variant="secondary">{getStyleLabel(value)}</Badge>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {buttonStyles.map((style) => {
          const selected = value === style.id;

          return (
            <button
              key={style.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(style.id)}
              className={cn(
                "min-w-0 rounded-lg border p-3 text-left transition-colors",
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "bg-muted/30 hover:bg-muted/60"
              )}
            >
              <p className="truncate text-sm font-semibold">{style.id}</p>
              <p
                className={cn(
                  "mt-1 text-xs leading-5",
                  selected ? "text-background/75" : "text-muted-foreground"
                )}
              >
                {style.detail}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function DesignPanel({
  settings,
  onChange,
}: {
  settings: DesignSettings;
  onChange: UpdateDesignSetting;
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Design Panel
          </p>
          <h3 className="mt-1 text-base font-semibold">Future editor controls</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Visual controls backed by component state only.
          </p>
        </div>
        <Badge variant="outline">no schema update</Badge>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ChoiceGroup
          label="Theme"
          options={["Studio Light", "Midnight", "Editorial"]}
          value={settings.theme}
          onChange={(value) => onChange("theme", value)}
        />
        <ChoiceGroup
          label="Button style"
          options={buttonStyles.map((style) => style.id)}
          value={settings.buttonStyle}
          onChange={(value) => onChange("buttonStyle", value as ButtonStyle)}
        />
        <ChoiceGroup
          label="Button radius"
          options={["8px", "14px", "24px"]}
          value={settings.radius}
          onChange={(value) => onChange("radius", value)}
        />
        <AlignmentChoice
          value={settings.textAlignment}
          onChange={(value) => onChange("textAlignment", value)}
        />
        <ChoiceGroup
          label="Image source mode"
          options={["URL field", "Library", "Generated"]}
          value={settings.imageSourceMode}
          onChange={(value) => onChange("imageSourceMode", value)}
        />
        <ChoiceGroup
          label="Border"
          options={["None", "Soft border", "Strong border"]}
          value={settings.border}
          onChange={(value) => onChange("border", value)}
        />
        <ChoiceGroup
          label="Shadow"
          options={["None", "Low shadow", "Lifted"]}
          value={settings.shadow}
          onChange={(value) => onChange("shadow", value)}
        />
        <ChoiceGroup
          label="Spacing"
          options={["Compact", "Comfortable", "Spacious"]}
          value={settings.spacing}
          onChange={(value) => onChange("spacing", value)}
        />
        <ChoiceGroup
          label="Preview density"
          options={["Dense", "Balanced", "Airy"]}
          value={settings.density}
          onChange={(value) => onChange("density", value)}
        />
      </div>
    </section>
  );
}

function StyleSpecificFields({
  settings,
  onChange,
}: {
  settings: DesignSettings;
  onChange: UpdateDesignSetting;
}) {
  if (settings.buttonStyle === "icon-left") {
    return (
      <div className="grid gap-4">
        <MockInput
          label="Image URL field mock"
          value={settings.imageUrl}
          onChange={(value) => onChange("imageUrl", value)}
        />
        <AlignmentChoice
          value={settings.textAlignment}
          onChange={(value) => onChange("textAlignment", value)}
        />
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="text-xs font-medium text-muted-foreground">Circular icon preview</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-full border bg-background">
              <ImageIcon className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">{settings.imageUrl}</p>
          </div>
        </div>
      </div>
    );
  }

  if (settings.buttonStyle === "image-full") {
    return (
      <div className="grid gap-4">
        <MockInput
          label="Background Image URL field mock"
          value={settings.backgroundImageUrl}
          onChange={(value) => onChange("backgroundImageUrl", value)}
        />
        <ChoiceGroup
          label="Aspect selector"
          options={["3:1", "2:1"]}
          value={settings.aspectRatio}
          onChange={(value) => onChange("aspectRatio", value as "3:1" | "2:1")}
        />
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">
            Overlay opacity mock: {settings.overlayOpacity}%
          </span>
          <input
            type="range"
            min={0}
            max={80}
            value={settings.overlayOpacity}
            onChange={(event) => onChange("overlayOpacity", Number(event.target.value))}
            className="mt-3 w-full accent-foreground"
          />
        </label>
        <MockToggle
          label="Text overlay"
          checked={settings.textOverlay}
          onToggle={() => onChange("textOverlay", !settings.textOverlay)}
        />
      </div>
    );
  }

  if (settings.buttonStyle === "text-only") {
    return (
      <div className="grid gap-4">
        <AlignmentChoice
          value={settings.textAlignment}
          onChange={(value) => onChange("textAlignment", value)}
        />
        <ChoiceGroup
          label="Font weight mock"
          options={["Regular", "Semibold", "Bold"]}
          value={settings.fontWeight}
          onChange={(value) => onChange("fontWeight", value)}
        />
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="text-xs font-medium text-muted-foreground">Minimal preview</p>
          <p
            className={cn(
              "mt-3 text-sm",
              getAlignClass(settings.textAlignment),
              settings.fontWeight === "Bold" && "font-bold",
              settings.fontWeight === "Semibold" && "font-semibold"
            )}
          >
            {settings.title}
          </p>
        </div>
      </div>
    );
  }

  if (settings.buttonStyle === "card-left-image") {
    return (
      <div className="grid gap-4">
        <MockInput
          label="Image URL field mock"
          value={settings.imageUrl}
          onChange={(value) => onChange("imageUrl", value)}
        />
        <MockInput
          label="Title"
          value={settings.title}
          onChange={(value) => onChange("title", value)}
        />
        <MockInput
          label="Description"
          value={settings.description}
          onChange={(value) => onChange("description", value)}
        />
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="text-xs font-medium text-muted-foreground">Left image card preview</p>
          <StylePreview settings={settings} compact />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <MockInput
        label="Title"
        value={settings.title}
        onChange={(value) => onChange("title", value)}
      />
      <MockTextarea
        label="Body textarea mock"
        value={settings.body}
        onChange={(value) => onChange("body", value)}
      />
      <div className="rounded-lg border bg-muted/30 p-3">
        <p className="text-xs font-medium text-muted-foreground">
          Line-break preservation note
        </p>
        <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">{settings.body}</p>
      </div>
    </div>
  );
}

function StylePreview({
  settings,
  compact = false,
}: {
  settings: DesignSettings;
  compact?: boolean;
}) {
  const radiusStyle = { borderRadius: settings.radius };
  const densityClass =
    settings.density === "Dense" ? "p-2" : settings.density === "Airy" ? "p-5" : "p-3";
  const borderClass =
    settings.border === "None"
      ? "border-transparent"
      : settings.border === "Strong border"
        ? "border-foreground/40"
        : "border-border";
  const shadowClass =
    settings.shadow === "None"
      ? "shadow-none"
      : settings.shadow === "Lifted"
        ? "shadow-lg"
        : "shadow-sm";
  const titleClass = cn(
    "font-semibold leading-tight",
    compact ? "text-xs" : "text-sm",
    settings.fontWeight === "Bold" && "font-bold",
    settings.fontWeight === "Regular" && "font-normal"
  );

  if (settings.buttonStyle === "image-full") {
    return (
      <div
        className={cn(
          "relative mt-3 overflow-hidden border bg-foreground text-background",
          shadowClass,
          borderClass,
          settings.aspectRatio === "3:1" ? "aspect-[3/1]" : "aspect-[2/1]"
        )}
        style={radiusStyle}
      >
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#111827,#64748b_55%,#f8fafc)]" />
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: settings.overlayOpacity / 100 }}
        />
        {settings.textOverlay ? (
          <div className={cn("absolute inset-0 flex items-end", getJustifyClass(settings.textAlignment))}>
            <div className={cn("max-w-full", densityClass, getAlignClass(settings.textAlignment))}>
              <p className={titleClass}>{settings.title}</p>
              {!compact ? (
                <p className="mt-1 text-xs leading-5 text-background/75">{settings.description}</p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  if (settings.buttonStyle === "text-only") {
    return (
      <div
        className={cn(
          "mt-3 border bg-background",
          densityClass,
          borderClass,
          shadowClass,
          getAlignClass(settings.textAlignment)
        )}
        style={radiusStyle}
      >
        <p className={titleClass}>{settings.title}</p>
      </div>
    );
  }

  if (settings.buttonStyle === "card-left-image") {
    return (
      <div
        className={cn(
          "mt-3 grid min-w-0 grid-cols-[64px_minmax(0,1fr)] gap-3 border bg-background",
          densityClass,
          borderClass,
          shadowClass
        )}
        style={radiusStyle}
      >
        <div className="grid min-h-16 place-items-center rounded-lg bg-muted">
          <ImageIcon className="size-5 text-muted-foreground" />
        </div>
        <div className="min-w-0 self-center">
          <p className={cn(titleClass, "truncate")}>{settings.title}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
            {settings.description}
          </p>
        </div>
      </div>
    );
  }

  if (settings.buttonStyle === "text-panel") {
    return (
      <div
        className={cn(
          "mt-3 border bg-background",
          densityClass,
          borderClass,
          shadowClass,
          getAlignClass(settings.textAlignment)
        )}
        style={radiusStyle}
      >
        <p className={titleClass}>{settings.title}</p>
        <p className="mt-2 text-xs leading-5 whitespace-pre-wrap text-muted-foreground">
          {settings.body}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mt-3 flex min-w-0 items-center gap-3 border bg-background",
        densityClass,
        borderClass,
        shadowClass,
        settings.textAlignment === "right" && "flex-row-reverse text-right",
        settings.textAlignment === "center" && "justify-center text-center"
      )}
      style={radiusStyle}
    >
      <div className="grid size-11 shrink-0 place-items-center rounded-full border bg-muted">
        <ImageIcon className="size-5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className={cn(titleClass, "truncate")}>{settings.title}</p>
        {!compact ? (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
            {settings.description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function StaticField({
  label,
  value,
  tall = false,
}: {
  label: string;
  value: string;
  tall?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div
        className={cn(
          "mt-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm break-words",
          tall ? "min-h-20 leading-6" : ""
        )}
      >
        {value}
      </div>
    </div>
  );
}

function MockEditorArea({
  selectedPage,
  selectedBlock,
  selectedLink,
  settings,
  validationHints,
}: {
  selectedPage: MockPage;
  selectedBlock: MockBlock;
  selectedLink: MockLinkItem;
  settings: DesignSettings;
  validationHints: string[];
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Editor
          </p>
          <h3 className="mt-1 text-base font-semibold">Selected link workspace</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {selectedLink.title} is selected inside {selectedBlock.label} on {selectedPage.route}.
            Controls below are local mock UI only.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">no form state save</Badge>
          <Badge variant="secondary">{settings.buttonStyle}</Badge>
          {selectedLink.prioritized ? (
            <Badge>
              <Star data-icon="inline-start" />
              prioritized
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border bg-muted/30">
        <div className="grid gap-4 p-4 md:grid-cols-[160px_minmax(0,1fr)]">
          <div className="rounded-xl border bg-background p-3">
            <div className="mx-auto size-20 rounded-full bg-muted" />
            <div className="mt-4 h-2 rounded bg-muted" />
            <div className="mt-2 h-2 w-2/3 rounded bg-muted" />
            <StylePreview settings={settings} compact />
          </div>
          <div className="grid content-center gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{selectedLink.title}</Badge>
              <Badge variant="outline">active style: {settings.buttonStyle}</Badge>
              <StatusBadge value={getLinkStatusLabel(selectedLink)} />
            </div>
            <h4 className="text-2xl font-semibold leading-tight">{selectedPage.headline}</h4>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              {selectedLink.description}
            </p>
            <MockValidationHints hints={validationHints} />
            <div className="max-w-xl">
              <StylePreview settings={settings} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="rounded-xl border bg-muted/30 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Active link card
              </p>
              <h4 className="mt-1 truncate text-lg font-semibold">{selectedLink.title}</h4>
            </div>
            <Badge variant="outline">{getStyleLabel(selectedLink.buttonStyle)}</Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {selectedLink.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="max-w-full truncate">
              <ExternalLink data-icon="inline-start" />
              {getLinkActionLabel(selectedLink)}
            </Badge>
            {selectedLink.lockType !== "none" ? (
              <Badge variant="secondary">
                <LockKeyhole data-icon="inline-start" />
                {selectedLink.lockType}
              </Badge>
            ) : null}
            {selectedLink.scheduleHideDate ? (
              <Badge variant="outline">
                <CalendarClock data-icon="inline-start" />
                hide {selectedLink.scheduleHideDate}
              </Badge>
            ) : null}
          </div>
          <StylePreview settings={settings} />
        </div>

        <MockStatsGrid link={selectedLink} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <StaticField label="Selected route" value={selectedPage.route} />
        <StaticField label="Selected block" value={selectedBlock.label} />
        <StaticField label="Selected link" value={selectedLink.title} />
        <StaticField label="Selected style" value={selectedLink.buttonStyle} />
        <StaticField label="Mock URL/action" value={getLinkActionLabel(selectedLink)} />
        <StaticField label="Mock state boundary" value="Local component state only" />
        <StaticField label="Planning note" value={selectedPage.previewNote} tall />
        <StaticField label="Link behavior" value={selectedLink.body} tall />
      </div>
    </section>
  );
}

function MockPropertyInspector({
  selectedBlock,
  selectedLink,
  settings,
  onChange,
  onLinkChange,
  onTogglePrioritized,
  validationHints,
}: {
  selectedBlock: MockBlock;
  selectedLink: MockLinkItem;
  settings: DesignSettings;
  onChange: UpdateDesignSetting;
  onLinkChange: UpdateSelectedLink;
  onTogglePrioritized: () => void;
  validationHints: string[];
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Property Inspector
          </p>
          <h3 className="mt-1 text-base font-semibold">
            {selectedLink.title} / {getStyleLabel(settings.buttonStyle)}
          </h3>
        </div>
        <PanelRight className="size-4 text-muted-foreground" />
      </div>

      <div className="mt-3">
        <SafetyLabelRow />
      </div>

      <div className="mt-4 grid gap-4">
        <PerLinkSettingsPanel
          link={selectedLink}
          settings={settings}
          validationHints={validationHints}
          onLinkChange={onLinkChange}
          onSettingChange={onChange}
          onTogglePrioritized={onTogglePrioritized}
        />

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Relevant block controls
          </p>
          <div className="mt-3 grid gap-2">
            {selectedBlock.controls.map((control) => (
              <div key={control} className="rounded-lg border bg-muted/30 px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{control}</p>
                  <span className="text-xs text-muted-foreground">mock</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <MockToggle label="Visibility" checked={selectedBlock.state === "enabled"} />
        <MockToggle label="Show on phone" checked />
        <MockToggle label="Show on desktop" checked />
        <MockToggle label="Hide in production" />
      </div>
    </section>
  );
}

function DeviceModeToggle({
  deviceMode,
  onSelectMode,
}: {
  deviceMode: DeviceMode;
  onSelectMode: (mode: DeviceMode) => void;
}) {
  const modes: Array<{ mode: DeviceMode; label: string; icon: typeof Smartphone }> = [
    { mode: "phone", label: "Phone", icon: Smartphone },
    { mode: "desktop", label: "Desktop", icon: Monitor },
  ];

  return (
    <div className="inline-flex rounded-lg border bg-muted/40 p-1">
      {modes.map((item) => {
        const Icon = item.icon;
        const selected = deviceMode === item.mode;

        return (
          <button
            key={item.mode}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelectMode(item.mode)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors",
              selected ? "bg-foreground text-background shadow-sm" : "text-foreground hover:bg-background"
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function MockDevicePreview({
  selectedPage,
  selectedLink,
  links,
  settings,
  deviceMode,
  onSelectMode,
}: {
  selectedPage: MockPage;
  selectedLink: MockLinkItem;
  links: MockLinkItem[];
  settings: DesignSettings;
  deviceMode: DeviceMode;
  onSelectMode: (mode: DeviceMode) => void;
}) {
  const isPhone = deviceMode === "phone";

  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Device Preview
          </p>
          <h3 className="mt-1 text-base font-semibold">Visual only</h3>
        </div>
        <DeviceModeToggle deviceMode={deviceMode} onSelectMode={onSelectMode} />
      </div>

      <div className="mt-4 rounded-lg border bg-muted/30 p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            {isPhone ? <Smartphone className="size-4" /> : <Monitor className="size-4" />}
            {isPhone ? "Phone mock preview" : "Desktop compact preview"}
          </div>
          <Eye className="size-4 text-muted-foreground" />
        </div>

        {isPhone ? (
          <div className="mx-auto mt-4 w-full max-w-[190px] rounded-3xl border bg-background p-2 shadow-sm">
            <div className="rounded-2xl bg-muted/40 p-3">
              <div className="h-16 rounded-xl bg-muted" />
              <p className="mt-3 truncate text-center text-xs font-semibold">{selectedPage.title}</p>
              <div className="mt-3">
                <StylePreview settings={settings} compact />
              </div>
              <div className="mt-3 grid gap-1.5">
                {links.slice(0, 3).map((link) => (
                  <div
                    key={link.id}
                    className={cn(
                      "h-5 rounded",
                      link.id === selectedLink.id ? "bg-foreground" : "bg-muted"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-lg border bg-background p-3 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
              <div className="h-32 rounded bg-muted" />
              <div className="grid min-w-0 gap-2">
                <div className="rounded bg-muted/50 p-2">
                  <p className="truncate text-xs font-semibold">{selectedPage.headline}</p>
                </div>
                <StylePreview settings={settings} compact />
                <div className="grid grid-cols-2 gap-2">
                  {links.slice(0, 4).map((link) => (
                    <div
                      key={link.id}
                      className={cn(
                        "rounded p-2",
                        link.id === selectedLink.id ? "bg-foreground text-background" : "bg-muted/70"
                      )}
                    >
                      <p className="truncate text-[11px] font-medium">{link.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function AdminUiV2LabPreview() {
  const [selectedPageRoute, setSelectedPageRoute] = useState(mockPages[0].route);
  const [selectedBlockId, setSelectedBlockId] = useState(mockBlocks[0].id);
  const [selectedLinkId, setSelectedLinkId] = useState(initialMockLinks[0].id);
  const [mockLinks, setMockLinks] = useState<MockLinkItem[]>(initialMockLinks);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [designSettings, setDesignSettings] = useState<DesignSettings>(defaultDesignSettings);
  const [pageSettingsByRoute, setPageSettingsByRoute] =
    useState<Record<string, PageSettings>>(initialPageSettingsByRoute);
  const [dirtyRoutes, setDirtyRoutes] = useState<Record<string, boolean>>({});
  const [publishFlowNote, setPublishFlowNote] = useState(
    "No publish flow action has run. Buttons below only update local mock state."
  );

  const selectedPage = useMemo(
    () => mockPages.find((page) => page.route === selectedPageRoute) ?? mockPages[0],
    [selectedPageRoute]
  );
  const selectedPageSettings = pageSettingsByRoute[selectedPageRoute] ?? initialPageSettingsByRoute["/bn9/main"];
  const selectedBlock = useMemo(
    () => mockBlocks.find((block) => block.id === selectedBlockId) ?? mockBlocks[0],
    [selectedBlockId]
  );
  const selectedLink = useMemo(
    () => mockLinks.find((link) => link.id === selectedLinkId) ?? mockLinks[0],
    [mockLinks, selectedLinkId]
  );
  const selectedLinkSettings = useMemo<DesignSettings>(
    () => ({
      ...designSettings,
      buttonStyle: selectedLink.buttonStyle,
      textAlignment: selectedLink.textAlignment,
      imageUrl: selectedLink.imageUrl,
      backgroundImageUrl: selectedLink.backgroundImageUrl,
      title: selectedLink.title,
      description: selectedLink.description,
      body: selectedLink.body,
    }),
    [designSettings, selectedLink]
  );
  const validationHints = useMemo(() => getValidationHints(selectedLink), [selectedLink]);
  const pageValidationHints = useMemo(
    () => getPageValidationHints(selectedPageSettings),
    [selectedPageSettings]
  );
  const hasUnsavedPageChanges = Boolean(dirtyRoutes[selectedPageRoute]);

  const updateSelectedLink: UpdateSelectedLink = (key, value) => {
    setMockLinks((current) =>
      current.map((link) => (link.id === selectedLink.id ? { ...link, [key]: value } : link))
    );
  };

  const updatePageSetting: UpdatePageSetting = (key, value) => {
    setPageSettingsByRoute((current) => ({
      ...current,
      [selectedPageRoute]: {
        ...selectedPageSettings,
        [key]: value,
      },
    }));
    setDirtyRoutes((current) => ({ ...current, [selectedPageRoute]: true }));
    setPublishFlowNote("Local page setting changed. Nothing has been saved or published.");
  };

  const updateDesignSetting: UpdateDesignSetting = (key, value) => {
    if (key === "buttonStyle") {
      updateSelectedLink("buttonStyle", value as ButtonStyle);
      return;
    }

    if (key === "textAlignment") {
      updateSelectedLink("textAlignment", value as TextAlign);
      return;
    }

    if (key === "imageUrl") {
      updateSelectedLink("imageUrl", value as string);
      return;
    }

    if (key === "backgroundImageUrl") {
      updateSelectedLink("backgroundImageUrl", value as string);
      return;
    }

    if (key === "title") {
      updateSelectedLink("title", value as string);
      return;
    }

    if (key === "description") {
      updateSelectedLink("description", value as string);
      return;
    }

    if (key === "body") {
      updateSelectedLink("body", value as string);
      return;
    }

    setDesignSettings((current) => ({ ...current, [key]: value }));
  };

  const moveLink = (linkId: string, direction: -1 | 1) => {
    setMockLinks((current) => {
      const currentIndex = current.findIndex((link) => link.id === linkId);
      const nextIndex = currentIndex + direction;

      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [movedLink] = next.splice(currentIndex, 1);
      next.splice(nextIndex, 0, movedLink);
      return next;
    });
  };

  const togglePrioritizedLink = () => {
    setMockLinks((current) =>
      current.map((link) => ({
        ...link,
        prioritized: link.id === selectedLink.id ? !selectedLink.prioritized : false,
      }))
    );
  };

  const clearSelectedPageDirtyState = () => {
    setDirtyRoutes((current) => ({ ...current, [selectedPageRoute]: false }));
    setPublishFlowNote("Save draft mock cleared the local unsaved badge only.");
  };

  const previewSelectedPageMock = () => {
    setPublishFlowNote(
      `Preview page mock points at ${getMockRoutePreview(selectedPageSettings)} without loading a route.`
    );
  };

  const publishSelectedPageMock = () => {
    setPageSettingsByRoute((current) => ({
      ...current,
      [selectedPageRoute]: {
        ...selectedPageSettings,
        status: "Published",
      },
    }));
    setDirtyRoutes((current) => ({ ...current, [selectedPageRoute]: true }));
    setPublishFlowNote("Publish mock changed only the local status badge to Published.");
  };

  const scheduleSelectedPageMock = () => {
    setPageSettingsByRoute((current) => ({
      ...current,
      [selectedPageRoute]: {
        ...selectedPageSettings,
        status: "Scheduled",
      },
    }));
    setDirtyRoutes((current) => ({ ...current, [selectedPageRoute]: true }));
    setPublishFlowNote("Schedule publish mock changed only the local status badge to Scheduled.");
  };

  return (
    <section className="rounded-xl border bg-background p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Admin UI V2
          </p>
          <h2 className="mt-2 text-lg font-semibold">Clickable mock backoffice/editor</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Local-state prototype for a future admin workspace. It does not import real
            editor components, save data, publish pages, call APIs, or update production stores.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">mock only</Badge>
          <Badge variant="outline">active style: {selectedLinkSettings.buttonStyle}</Badge>
          <Badge variant="outline">selected link: {selectedLink.title}</Badge>
        </div>
      </div>

      <div className="mt-4 rounded-xl border bg-muted/30 p-3">
        <SafetyLabelRow />
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border bg-muted/30">
        <MockTopBar
          selectedPage={selectedPage}
          pageSettings={selectedPageSettings}
          selectedLink={selectedLink}
          deviceMode={deviceMode}
          selectedStyle={selectedLinkSettings.buttonStyle}
          hasUnsavedChanges={hasUnsavedPageChanges}
        />

        <div className="grid lg:grid-cols-[220px_minmax(0,1fr)]">
          <MockSidebar />

          <div className="grid min-w-0 gap-4 p-4 2xl:grid-cols-[minmax(0,1fr)_420px]">
            <main className="grid min-w-0 content-start gap-4">
              <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
                <MockPagesArea
                  selectedPage={selectedPage}
                  pageSettingsByRoute={pageSettingsByRoute}
                  dirtyRoutes={dirtyRoutes}
                  onSelectPage={(page) => setSelectedPageRoute(page.route)}
                />
                <MockLinkManager
                  links={mockLinks}
                  selectedLink={selectedLink}
                  onSelectLink={setSelectedLinkId}
                  onMoveLink={moveLink}
                />
              </div>
              <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <MockBlockManager
                  selectedBlock={selectedBlock}
                  onSelectBlock={(block) => setSelectedBlockId(block.id)}
                />
                <ButtonStyleSelector
                  value={selectedLinkSettings.buttonStyle}
                  onChange={(value) => updateDesignSetting("buttonStyle", value)}
                />
              </div>
              <MockPageSettingsPanel
                settings={selectedPageSettings}
                validationHints={pageValidationHints}
                hasUnsavedChanges={hasUnsavedPageChanges}
                onChange={updatePageSetting}
              />
              <MockSeoSocialPanel settings={selectedPageSettings} onChange={updatePageSetting} />
              <MockSharePreviewCards
                settings={selectedPageSettings}
                selectedLink={selectedLink}
              />
              <MockPublishFlow
                settings={selectedPageSettings}
                hasUnsavedChanges={hasUnsavedPageChanges}
                publishFlowNote={publishFlowNote}
                onSaveDraft={clearSelectedPageDirtyState}
                onPreview={previewSelectedPageMock}
                onPublish={publishSelectedPageMock}
                onSchedule={scheduleSelectedPageMock}
              />
              <MockPageValidationChecklist
                settings={selectedPageSettings}
                links={mockLinks}
                validationHints={pageValidationHints}
              />
              <DesignPanel settings={selectedLinkSettings} onChange={updateDesignSetting} />
              <MockEditorArea
                selectedPage={selectedPage}
                selectedBlock={selectedBlock}
                selectedLink={selectedLink}
                settings={selectedLinkSettings}
                validationHints={validationHints}
              />
            </main>

            <aside className="grid min-w-0 content-start gap-4 xl:grid-cols-2 2xl:grid-cols-1">
              <MockPropertyInspector
                selectedBlock={selectedBlock}
                selectedLink={selectedLink}
                settings={selectedLinkSettings}
                onChange={updateDesignSetting}
                onLinkChange={updateSelectedLink}
                onTogglePrioritized={togglePrioritizedLink}
                validationHints={validationHints}
              />
              <MockDevicePreview
                selectedPage={selectedPage}
                selectedLink={selectedLink}
                links={mockLinks}
                settings={selectedLinkSettings}
                deviceMode={deviceMode}
                onSelectMode={setDeviceMode}
              />
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
