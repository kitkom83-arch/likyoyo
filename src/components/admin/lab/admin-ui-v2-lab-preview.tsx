"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  BarChart3,
  Blocks,
  Eye,
  FileText,
  FormInput,
  ImageIcon,
  Monitor,
  Palette,
  PanelRight,
  Settings,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type DeviceMode = "phone" | "desktop";
type ButtonStyle = "icon-left" | "image-full" | "text-only" | "card-left-image" | "text-panel";
type TextAlign = "left" | "center" | "right";

type MockPage = {
  route: string;
  title: string;
  status: "active" | "draft" | "mock";
  detail: string;
  headline: string;
  previewNote: string;
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

const safeLabels = ["local mock state only", "no schema update", "no save", "no publish"];

const alignOptions: TextAlign[] = ["left", "center", "right"];

const getStatusLabel = (value: string) => {
  if (value === "active") return "active";
  if (value === "enabled") return "enabled";
  return value;
};

const getStyleLabel = (style: ButtonStyle) =>
  buttonStyles.find((item) => item.id === style)?.label ?? style;

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
  deviceMode,
  selectedStyle,
}: {
  selectedPage: MockPage;
  deviceMode: DeviceMode;
  selectedStyle: ButtonStyle;
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
            <h3 className="text-lg font-semibold leading-tight">{selectedPage.route}</h3>
            <Badge variant="outline">no real route loading</Badge>
            <Badge variant="secondary">{getStyleLabel(selectedStyle)}</Badge>
          </div>
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
  onSelectPage,
}: {
  selectedPage: MockPage;
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
                <StatusBadge value={page.status} />
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
        <p className="mt-2 text-sm leading-6 whitespace-pre-line">{settings.body}</p>
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
        <p className="mt-2 text-xs leading-5 whitespace-pre-line text-muted-foreground">
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
          "mt-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm",
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
  settings,
}: {
  selectedPage: MockPage;
  selectedBlock: MockBlock;
  settings: DesignSettings;
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Editor
          </p>
          <h3 className="mt-1 text-base font-semibold">Selected block preview</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {selectedBlock.label} is selected on {selectedPage.route}. Controls below are static
            mock UI only.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">no form state save</Badge>
          <Badge variant="secondary">{settings.buttonStyle}</Badge>
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
              <Badge variant="secondary">{selectedBlock.previewTitle}</Badge>
              <Badge variant="outline">active style: {settings.buttonStyle}</Badge>
            </div>
            <h4 className="text-2xl font-semibold leading-tight">{selectedPage.headline}</h4>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              {selectedBlock.previewBody}
            </p>
            <div className="max-w-xl">
              <StylePreview settings={settings} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <StaticField label="Selected route" value={selectedPage.route} />
        <StaticField label="Selected block" value={selectedBlock.label} />
        <StaticField label="Selected style" value={settings.buttonStyle} />
        <StaticField label="Mock state boundary" value="Local component state only" />
        <StaticField label="Planning note" value={selectedPage.previewNote} tall />
        <StaticField label="Block behavior" value={selectedBlock.previewBody} tall />
      </div>
    </section>
  );
}

function MockPropertyInspector({
  selectedBlock,
  settings,
  onChange,
}: {
  selectedBlock: MockBlock;
  settings: DesignSettings;
  onChange: UpdateDesignSetting;
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Property Inspector
          </p>
          <h3 className="mt-1 text-base font-semibold">
            {selectedBlock.label} / {getStyleLabel(settings.buttonStyle)}
          </h3>
        </div>
        <PanelRight className="size-4 text-muted-foreground" />
      </div>

      <div className="mt-3">
        <SafetyLabelRow />
      </div>

      <div className="mt-4 grid gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Style-specific mock fields
          </p>
          <div className="mt-3">
            <StyleSpecificFields settings={settings} onChange={onChange} />
          </div>
        </div>

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
  selectedBlock,
  settings,
  deviceMode,
  onSelectMode,
}: {
  selectedPage: MockPage;
  selectedBlock: MockBlock;
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
                {mockBlocks.slice(0, 3).map((block) => (
                  <div
                    key={block.id}
                    className={cn(
                      "h-5 rounded",
                      block.id === selectedBlock.id ? "bg-foreground" : "bg-muted"
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
                  {mockBlocks.slice(0, 4).map((block) => (
                    <div
                      key={block.id}
                      className={cn(
                        "h-12 rounded",
                        block.id === selectedBlock.id ? "bg-foreground" : "bg-muted/70"
                      )}
                    />
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
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [designSettings, setDesignSettings] = useState<DesignSettings>(defaultDesignSettings);

  const selectedPage = useMemo(
    () => mockPages.find((page) => page.route === selectedPageRoute) ?? mockPages[0],
    [selectedPageRoute]
  );
  const selectedBlock = useMemo(
    () => mockBlocks.find((block) => block.id === selectedBlockId) ?? mockBlocks[0],
    [selectedBlockId]
  );

  const updateDesignSetting: UpdateDesignSetting = (key, value) => {
    setDesignSettings((current) => ({ ...current, [key]: value }));
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
          <Badge variant="outline">active style: {designSettings.buttonStyle}</Badge>
        </div>
      </div>

      <div className="mt-4 rounded-xl border bg-muted/30 p-3">
        <SafetyLabelRow />
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border bg-muted/30">
        <MockTopBar
          selectedPage={selectedPage}
          deviceMode={deviceMode}
          selectedStyle={designSettings.buttonStyle}
        />

        <div className="grid lg:grid-cols-[220px_minmax(0,1fr)]">
          <MockSidebar />

          <div className="grid min-w-0 gap-4 p-4 2xl:grid-cols-[minmax(0,1fr)_390px]">
            <main className="grid min-w-0 content-start gap-4">
              <div className="grid gap-4 xl:grid-cols-2">
                <MockPagesArea
                  selectedPage={selectedPage}
                  onSelectPage={(page) => setSelectedPageRoute(page.route)}
                />
                <MockBlockManager
                  selectedBlock={selectedBlock}
                  onSelectBlock={(block) => setSelectedBlockId(block.id)}
                />
              </div>
              <ButtonStyleSelector
                value={designSettings.buttonStyle}
                onChange={(value) => updateDesignSetting("buttonStyle", value)}
              />
              <DesignPanel settings={designSettings} onChange={updateDesignSetting} />
              <MockEditorArea
                selectedPage={selectedPage}
                selectedBlock={selectedBlock}
                settings={designSettings}
              />
            </main>

            <aside className="grid min-w-0 content-start gap-4 xl:grid-cols-2 2xl:grid-cols-1">
              <MockPropertyInspector
                selectedBlock={selectedBlock}
                settings={designSettings}
                onChange={updateDesignSetting}
              />
              <MockDevicePreview
                selectedPage={selectedPage}
                selectedBlock={selectedBlock}
                settings={designSettings}
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
