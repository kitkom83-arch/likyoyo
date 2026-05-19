"use client";

import {
  BarChart3,
  Blocks,
  Eye,
  FileText,
  FormInput,
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

const safeLabels = ["local mock state only", "no save", "no publish", "no route loading", "no schema update"];
const spacingControls = ["Section gap", "Block padding", "Mobile density"];

const getStatusLabel = (value: string) => {
  if (value === "active") return "active";
  if (value === "enabled") return "enabled";
  return value;
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
}: {
  selectedPage: MockPage;
  deviceMode: DeviceMode;
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
                selected ? "border-foreground bg-foreground text-background" : "bg-muted/30 hover:bg-muted/60"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{page.route}</p>
                  <p className={cn("mt-1 text-xs", selected ? "text-background/75" : "text-muted-foreground")}>
                    {page.title}
                  </p>
                </div>
                <StatusBadge value={page.status} />
              </div>
              <p className={cn("mt-2 text-xs leading-5", selected ? "text-background/75" : "text-muted-foreground")}>
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
                selected ? "border-foreground bg-foreground text-background" : "bg-muted/30 hover:bg-muted/60"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{block.label}</p>
                  <p className={cn("mt-1 text-xs leading-5", selected ? "text-background/75" : "text-muted-foreground")}>
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
}: {
  selectedPage: MockPage;
  selectedBlock: MockBlock;
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
            {selectedBlock.label} is selected on {selectedPage.route}. Controls below are static mock UI only.
          </p>
        </div>
        <Badge variant="outline">no form state save</Badge>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border bg-muted/30">
        <div className="grid gap-4 p-4 md:grid-cols-[160px_minmax(0,1fr)]">
          <div className="rounded-xl border bg-background p-3">
            <div className="mx-auto size-20 rounded-full bg-muted" />
            <div className="mt-4 h-2 rounded bg-muted" />
            <div className="mt-2 h-2 w-2/3 rounded bg-muted" />
            <div className="mt-5 h-8 rounded-lg bg-foreground" />
          </div>
          <div className="grid content-center gap-3">
            <Badge variant="secondary">{selectedBlock.previewTitle}</Badge>
            <h4 className="text-2xl font-semibold leading-tight">{selectedPage.headline}</h4>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              {selectedBlock.previewBody}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <StaticField label="Selected route" value={selectedPage.route} />
        <StaticField label="Selected block" value={selectedBlock.label} />
        <StaticField label="Editor headline" value={selectedPage.headline} />
        <StaticField label="Mock state boundary" value="Local component state only" />
        <StaticField label="Planning note" value={selectedPage.previewNote} tall />
        <StaticField label="Block behavior" value={selectedBlock.previewBody} tall />
      </div>
    </section>
  );
}

function MockToggle({ label, checked = false }: { label: string; checked?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
      <p className="text-sm font-medium">{label}</p>
      <div
        className={cn(
          "flex h-6 w-11 items-center rounded-full p-1",
          checked ? "justify-end bg-foreground" : "justify-start bg-muted"
        )}
      >
        <span className="size-4 rounded-full bg-background shadow-sm" />
      </div>
    </div>
  );
}

function MockPropertyInspector({ selectedBlock }: { selectedBlock: MockBlock }) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Property Inspector
          </p>
          <h3 className="mt-1 text-base font-semibold">{selectedBlock.label}</h3>
        </div>
        <PanelRight className="size-4 text-muted-foreground" />
      </div>

      <div className="mt-4 grid gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Relevant mock controls
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

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Spacing controls
          </p>
          <div className="mt-3 grid gap-2">
            {spacingControls.map((control, index) => (
              <div key={control} className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <p className="font-medium">{control}</p>
                  <p className="text-xs text-muted-foreground">{index + 2}x</p>
                </div>
                <div className="mt-2 h-2 rounded-full bg-background">
                  <div className="h-full rounded-full bg-foreground" style={{ width: `${44 + index * 18}%` }} />
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
  deviceMode,
  onSelectMode,
}: {
  selectedPage: MockPage;
  selectedBlock: MockBlock;
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
            {isPhone ? "Phone mock preview" : "Desktop mock preview"}
          </div>
          <Eye className="size-4 text-muted-foreground" />
        </div>

        {isPhone ? (
          <div className="mx-auto mt-4 w-40 rounded-3xl border bg-background p-2 shadow-sm">
            <div className="rounded-2xl bg-muted/40 p-3">
              <div className="h-16 rounded-xl bg-muted" />
              <p className="mt-3 truncate text-center text-xs font-semibold">{selectedPage.title}</p>
              <div className="mt-3 grid gap-1.5">
                {mockBlocks.slice(0, 4).map((block) => (
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
            <div className="grid gap-2 sm:grid-cols-[0.8fr_1.2fr]">
              <div className="h-32 rounded bg-muted" />
              <div className="grid gap-2">
                <div className="rounded bg-muted/50 p-2">
                  <p className="truncate text-xs font-semibold">{selectedPage.headline}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {mockBlocks.slice(0, 4).map((block) => (
                    <div
                      key={block.id}
                      className={cn(
                        "h-16 rounded",
                        block.id === selectedBlock.id ? "bg-foreground" : "bg-muted/70"
                      )}
                    />
                  ))}
                </div>
                <div className="h-12 rounded bg-muted/70" />
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

  const selectedPage = useMemo(
    () => mockPages.find((page) => page.route === selectedPageRoute) ?? mockPages[0],
    [selectedPageRoute]
  );
  const selectedBlock = useMemo(
    () => mockBlocks.find((block) => block.id === selectedBlockId) ?? mockBlocks[0],
    [selectedBlockId]
  );

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
        <Badge variant="secondary">mock only</Badge>
      </div>

      <div className="mt-4 rounded-xl border bg-muted/30 p-3">
        <SafetyLabelRow />
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border bg-muted/30">
        <MockTopBar selectedPage={selectedPage} deviceMode={deviceMode} />

        <div className="grid lg:grid-cols-[220px_minmax(0,1fr)]">
          <MockSidebar />

          <div className="grid gap-4 p-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
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
              <MockEditorArea selectedPage={selectedPage} selectedBlock={selectedBlock} />
            </main>

            <aside className="grid min-w-0 content-start gap-4 xl:grid-cols-2 2xl:grid-cols-1">
              <MockPropertyInspector selectedBlock={selectedBlock} />
              <MockDevicePreview
                selectedPage={selectedPage}
                selectedBlock={selectedBlock}
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
