"use client";

import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  MonitorSmartphone,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockBuilderData } from "@/features/builder/mock-data";
import { cn } from "@/lib/utils";
import { AdminUiV2LabPreview } from "@/components/admin/lab/admin-ui-v2-lab-preview";
import { AnalyticsLabPreview } from "@/components/admin/lab/analytics-lab-preview";
import { FormEngineLabPreview } from "@/components/admin/lab/form-engine-lab-preview";
import { PublicResponsiveLabPreview } from "@/components/admin/lab/public-responsive-lab-preview";
import { SafetyNotesLab } from "@/components/admin/lab/safety-notes-lab";

type LabTabId = "responsive" | "admin-ui" | "form-engine" | "analytics" | "safety";

type FlagRow = {
  envName: string;
  label: string;
  description: string;
  enabled: boolean;
};

type LabTab = {
  id: LabTabId;
  label: string;
  description: string;
  icon: LucideIcon;
};

const labTabs: LabTab[] = [
  {
    id: "responsive",
    label: "Responsive Preview",
    description: "Phone and PC views from mockBuilderData.",
    icon: MonitorSmartphone,
  },
  {
    id: "admin-ui",
    label: "Admin UI V2",
    description: "Mock admin layout concept only.",
    icon: LayoutDashboard,
  },
  {
    id: "form-engine",
    label: "Form Engine",
    description: "Mock templates and field inventory.",
    icon: ClipboardList,
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Mock performance cards only.",
    icon: BarChart3,
  },
  {
    id: "safety",
    label: "Safety Notes",
    description: "Isolation rules and disabled production paths.",
    icon: ShieldCheck,
  },
];

function CurrentFlagsPanel({ flagRows }: { flagRows: FlagRow[] }) {
  return (
    <aside className="rounded-xl border bg-background p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Lab Controls
          </p>
          <h2 className="mt-2 text-lg font-semibold">Current flags</h2>
        </div>
        <Badge variant="outline">read-only</Badge>
      </div>
      <div className="mt-4 grid gap-3">
        {flagRows.map((flag) => (
          <div key={flag.envName} className="rounded-lg border p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{flag.label}</p>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  flag.enabled
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {flag.enabled ? "on" : "off"}
              </span>
            </div>
            <p className="mt-1 break-all text-xs text-muted-foreground">{flag.envName}</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{flag.description}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}

function MockSourcePanel() {
  return (
    <section className="rounded-xl border bg-background p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Data Boundary
          </p>
          <h2 className="mt-2 text-lg font-semibold">Mock profile source</h2>
        </div>
        <Badge variant="secondary">mockBuilderData only</Badge>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-lg border p-3">
          <dt className="text-xs text-muted-foreground">Slug</dt>
          <dd className="mt-1 font-medium">{mockBuilderData.header.username}</dd>
        </div>
        <div className="rounded-lg border p-3">
          <dt className="text-xs text-muted-foreground">Display name</dt>
          <dd className="mt-1 font-medium">{mockBuilderData.header.displayName}</dd>
        </div>
        <div className="rounded-lg border p-3">
          <dt className="text-xs text-muted-foreground">Header layout</dt>
          <dd className="mt-1 font-medium">{mockBuilderData.header.layout}</dd>
        </div>
      </dl>
    </section>
  );
}

function ResponsivePreviewTab({ flagRows }: { flagRows: FlagRow[] }) {
  return (
    <div className="grid gap-4">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <PublicResponsiveLabPreview />
        <CurrentFlagsPanel flagRows={flagRows} />
      </section>
      <MockSourcePanel />
    </div>
  );
}

export function LabWorkspaceTabs({ flagRows }: { flagRows: FlagRow[] }) {
  const [activeTab, setActiveTab] = useState<LabTabId>("responsive");
  const activeTabMeta = useMemo(
    () => labTabs.find((tab) => tab.id === activeTab) ?? labTabs[0],
    [activeTab]
  );

  return (
    <section className="grid min-w-0 gap-4">
      <div className="min-w-0 rounded-xl border bg-background p-3 shadow-sm">
        <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Lab workspace tabs">
          {labTabs.map((tab) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.id;

            return (
              <Button
                key={tab.id}
                type="button"
                variant={selected ? "default" : "ghost"}
                className="h-auto min-w-fit justify-start px-3 py-2"
                role="tab"
                aria-selected={selected}
                aria-controls={`lab-panel-${tab.id}`}
                id={`lab-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon data-icon="inline-start" />
                <span className="text-left">{tab.label}</span>
              </Button>
            );
          })}
        </div>
        <div className="mt-3 rounded-lg bg-muted/40 px-4 py-3">
          <p className="text-sm font-medium">{activeTabMeta.label}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {activeTabMeta.description}
          </p>
        </div>
      </div>

      <div
        className="min-w-0"
        role="tabpanel"
        id={`lab-panel-${activeTab}`}
        aria-labelledby={`lab-tab-${activeTab}`}
      >
        {activeTab === "responsive" ? <ResponsivePreviewTab flagRows={flagRows} /> : null}
        {activeTab === "admin-ui" ? <AdminUiV2LabPreview /> : null}
        {activeTab === "form-engine" ? <FormEngineLabPreview /> : null}
        {activeTab === "analytics" ? <AnalyticsLabPreview /> : null}
        {activeTab === "safety" ? <SafetyNotesLab flagRows={flagRows} /> : null}
      </div>
    </section>
  );
}
