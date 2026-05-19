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

import { Badge } from "@/components/ui/badge";

const adminNavItems = [
  { label: "Pages", icon: FileText, active: true },
  { label: "Blocks", icon: Blocks, active: false },
  { label: "Design", icon: Palette, active: false },
  { label: "Forms", icon: FormInput, active: false },
  { label: "Analytics", icon: BarChart3, active: false },
  { label: "Settings", icon: Settings, active: false },
];

const mockPages = [
  { route: "/bn9/main", title: "Main landing", status: "active", detail: "Hero, offers, contact" },
  { route: "/bn9/promo", title: "Promo page", status: "draft", detail: "Seasonal campaign" },
  { route: "/bn9/support", title: "Support page", status: "mock", detail: "Static support concept" },
];

const mockBlocks = [
  { label: "Hero Header", state: "enabled", detail: "Brand intro and avatar" },
  { label: "Button Group", state: "enabled", detail: "Primary links and CTAs" },
  { label: "Form Block", state: "disabled", detail: "No endpoint wiring" },
  { label: "Embed Post", state: "enabled", detail: "Static content preview" },
  { label: "Analytics Card", state: "disabled", detail: "Mock metrics only" },
];

const styleControls = ["Theme", "Button shape", "Card surface", "Accent color"];
const spacingControls = ["Section gap", "Block padding", "Mobile density"];
const devicePreviewBars = ["Hero", "Links", "Form", "Embed"];

function StatusBadge({ value }: { value: string }) {
  if (value === "active" || value === "enabled") {
    return <Badge>enabled</Badge>;
  }

  if (value === "draft") {
    return <Badge variant="outline">draft</Badge>;
  }

  return <Badge variant="secondary">{value}</Badge>;
}

function MockTopBar() {
  return (
    <header className="border-b bg-background px-4 py-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Current mock page route
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold leading-tight">/bn9/main</h3>
            <Badge variant="outline">no real route loading</Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Mock saved 2 min ago</Badge>
          <Badge variant="outline">
            <Monitor data-icon="inline-start" />
            Desktop mode
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
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                item.active ? "bg-foreground text-background" : "bg-muted/50 text-foreground"
              }`}
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
          Visual-only lab shell. No save, publish, schema, route, or store updates.
        </p>
      </div>
    </aside>
  );
}

function MockPagesArea() {
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
        {mockPages.map((page) => (
          <article key={page.route} className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{page.route}</p>
                <p className="mt-1 text-xs text-muted-foreground">{page.title}</p>
              </div>
              <StatusBadge value={page.status} />
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{page.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function MockBlockManager() {
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
        {mockBlocks.map((block, index) => (
          <article
            key={block.label}
            className={`rounded-lg border p-3 ${
              index === 0 ? "bg-foreground text-background" : "bg-muted/30"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{block.label}</p>
                <p
                  className={`mt-1 text-xs leading-5 ${
                    index === 0 ? "text-background/75" : "text-muted-foreground"
                  }`}
                >
                  {block.detail}
                </p>
              </div>
              <StatusBadge value={block.state} />
            </div>
          </article>
        ))}
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
        className={`mt-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm ${
          tall ? "min-h-20 leading-6" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function MockEditorArea() {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Editor
          </p>
          <h3 className="mt-1 text-base font-semibold">Selected block preview</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Hero Header is selected. Controls below are static mock UI only.
          </p>
        </div>
        <Badge variant="outline">read-only controls</Badge>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border bg-muted/30">
        <div className="grid gap-4 p-4 md:grid-cols-[160px_minmax(0,1fr)]">
          <div className="rounded-xl border bg-background p-3">
            <div className="mx-auto size-20 rounded-full bg-muted" />
            <div className="mt-4 h-2 rounded bg-muted" />
            <div className="mt-2 h-2 w-2/3 rounded bg-muted" />
          </div>
          <div className="grid content-center gap-3">
            <Badge variant="secondary">Hero Header</Badge>
            <h4 className="text-2xl font-semibold leading-tight">Northfield Studio</h4>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Future public-page hero concept with brand intro, CTA, and responsive spacing.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <StaticField label="Display name" value="Northfield Studio" />
        <StaticField label="Primary CTA label" value="Book a consultation" />
        <StaticField
          label="Intro text"
          value="Static field preview for layout planning. No input submission is wired."
          tall
        />
        <StaticField label="Selected route" value="/bn9/main" />
      </div>
    </section>
  );
}

function MockToggle({ label, checked = false }: { label: string; checked?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
      <p className="text-sm font-medium">{label}</p>
      <div
        className={`flex h-6 w-11 items-center rounded-full p-1 ${
          checked ? "justify-end bg-foreground" : "justify-start bg-muted"
        }`}
      >
        <span className="size-4 rounded-full bg-background shadow-sm" />
      </div>
    </div>
  );
}

function MockPropertyInspector() {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Property Inspector
          </p>
          <h3 className="mt-1 text-base font-semibold">Hero Header</h3>
        </div>
        <PanelRight className="size-4 text-muted-foreground" />
      </div>

      <div className="mt-4 grid gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Style controls
          </p>
          <div className="mt-3 grid gap-2">
            {styleControls.map((control) => (
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

        <MockToggle label="Visibility" checked />
        <MockToggle label="Show on phone" checked />
        <MockToggle label="Show on desktop" checked />
        <MockToggle label="Hide in production" />
      </div>
    </section>
  );
}

function MockDevicePreview() {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Device Preview
          </p>
          <h3 className="mt-1 text-base font-semibold">Visual only</h3>
        </div>
        <Eye className="size-4 text-muted-foreground" />
      </div>

      <div className="mt-4 grid gap-4">
        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Smartphone className="size-4" />
            Compact phone card
          </div>
          <div className="mx-auto mt-3 w-32 rounded-2xl border bg-background p-2">
            <div className="h-16 rounded-xl bg-muted" />
            <div className="mx-auto mt-2 size-8 rounded-full bg-muted" />
            <div className="mt-3 grid gap-1.5">
              {devicePreviewBars.map((bar) => (
                <div key={bar} className="h-5 rounded bg-muted/70" />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Monitor className="size-4" />
            Desktop mini preview
          </div>
          <div className="mt-3 rounded-lg border bg-background p-3">
            <div className="grid gap-2 sm:grid-cols-[0.8fr_1.2fr]">
              <div className="h-28 rounded bg-muted" />
              <div className="grid gap-2">
                <div className="h-8 rounded bg-muted" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-16 rounded bg-muted/70" />
                  <div className="h-16 rounded bg-muted/70" />
                </div>
                <div className="h-12 rounded bg-muted/70" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AdminUiV2LabPreview() {
  return (
    <section className="rounded-xl border bg-background p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Admin UI V2
          </p>
          <h2 className="mt-2 text-lg font-semibold">Modern mock backoffice/editor</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Static lab concept for a future admin workspace. It does not import real editor
            components, save data, publish pages, call APIs, or update production stores.
          </p>
        </div>
        <Badge variant="secondary">mock only</Badge>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border bg-muted/30">
        <MockTopBar />

        <div className="grid min-h-[760px] lg:grid-cols-[220px_minmax(0,1fr)]">
          <MockSidebar />

          <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_340px]">
            <main className="grid content-start gap-4">
              <div className="grid gap-4 xl:grid-cols-[minmax(260px,0.85fr)_minmax(300px,1fr)]">
                <MockPagesArea />
                <MockBlockManager />
              </div>
              <MockEditorArea />
            </main>

            <aside className="grid content-start gap-4">
              <MockPropertyInspector />
              <MockDevicePreview />
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
