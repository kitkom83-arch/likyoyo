import { CalendarClock, Eye, ExternalLink, LockKeyhole, Monitor, PanelRight, Smartphone, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { MockFieldSettingsPanel } from "./mock-forms";
import { PerLinkSettingsPanel, StaticField, StylePreview } from "./mock-links";
import {
  MockStatsGrid,
  MockToggle,
  MockValidationHints,
  SafetyLabelRow,
  StatusBadge,
} from "./mock-shared";
import type {
  DesignSettings,
  DeviceMode,
  MockBlock,
  MockFormField,
  MockFormTemplate,
  MockLinkItem,
  MockPage,
  MockSubmissionRouting,
  MockTopLinkAnalytics,
  UpdateDesignSetting,
  UpdateFormField,
  UpdateSelectedLink,
} from "./types";
import { getFormStatusLabel, getLinkActionLabel, getLinkStatusLabel, getStyleLabel } from "./mock-utils";

export function MockEditorArea({
  selectedPage,
  selectedBlock,
  selectedLink,
  selectedForm,
  selectedFormFields,
  routing,
  settings,
  validationHints,
}: {
  selectedPage: MockPage;
  selectedBlock: MockBlock;
  selectedLink: MockLinkItem;
  selectedForm: MockFormTemplate;
  selectedFormFields: MockFormField[];
  routing: MockSubmissionRouting;
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
            {selectedForm.title} is the active mock form block. Controls below are local mock UI only.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">no form state save</Badge>
          <Badge variant="outline">no submission</Badge>
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
            <div className="max-w-xl rounded-xl border bg-background p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{selectedForm.title}</Badge>
                <Badge variant="outline">{routing.destination || "missing destination"}</Badge>
                <Badge variant="outline">no real submit</Badge>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {selectedFormFields.slice(0, 3).map((field) => (
                  <div key={field.id} className="rounded-lg border bg-muted/30 px-3 py-2">
                    <p className="truncate text-xs font-semibold">
                      {field.label || "Untitled field"}
                    </p>
                    <p className="mt-1 truncate text-[11px] text-muted-foreground">
                      {field.placeholder || field.type}
                    </p>
                  </div>
                ))}
              </div>
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

      <div className="mt-4 rounded-xl border bg-muted/30 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Active form block
            </p>
            <h4 className="mt-1 truncate text-lg font-semibold">{selectedForm.title}</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge value={getFormStatusLabel(selectedForm)} />
            <Badge variant="outline">{routing.destination || "missing destination"}</Badge>
          </div>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {selectedForm.description}
        </p>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {selectedFormFields.slice(0, 6).map((field) => (
            <div key={field.id} className="rounded-lg border bg-background p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 truncate text-sm font-medium">
                  {field.label || "Untitled field"}
                </p>
                <Badge variant="outline">{field.type}</Badge>
              </div>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                {field.helpText || field.placeholder || "Local mock field"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <StaticField label="Selected route" value={selectedPage.route} />
        <StaticField label="Selected block" value={selectedBlock.label} />
        <StaticField label="Selected link" value={selectedLink.title} />
        <StaticField label="Selected form" value={selectedForm.title} />
        <StaticField label="Mock destination" value={routing.destination || "missing destination"} />
        <StaticField label="Selected style" value={selectedLink.buttonStyle} />
        <StaticField label="Mock URL/action" value={getLinkActionLabel(selectedLink)} />
        <StaticField label="Mock state boundary" value="Local component state only" />
        <StaticField label="Planning note" value={selectedPage.previewNote} tall />
        <StaticField label="Link behavior" value={selectedLink.body} tall />
      </div>
    </section>
  );
}

export function MockPropertyInspector({
  selectedBlock,
  selectedLink,
  selectedForm,
  selectedField,
  settings,
  onChange,
  onLinkChange,
  onFieldChange,
  onTogglePrioritized,
  validationHints,
  formValidationHints,
}: {
  selectedBlock: MockBlock;
  selectedLink: MockLinkItem;
  selectedForm: MockFormTemplate;
  selectedField: MockFormField;
  settings: DesignSettings;
  onChange: UpdateDesignSetting;
  onLinkChange: UpdateSelectedLink;
  onFieldChange: UpdateFormField;
  onTogglePrioritized: () => void;
  validationHints: string[];
  formValidationHints: string[];
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Property Inspector
          </p>
          <h3 className="mt-1 text-base font-semibold">
            {selectedForm.title} / {selectedField.label || "Untitled field"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Link context: {selectedLink.title} / {getStyleLabel(settings.buttonStyle)}
          </p>
        </div>
        <PanelRight className="size-4 text-muted-foreground" />
      </div>

      <div className="mt-3">
        <SafetyLabelRow />
      </div>

      <div className="mt-4 grid gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Form validation hints
          </p>
          <div className="mt-2">
            <MockValidationHints hints={formValidationHints} />
          </div>
        </div>

        <MockFieldSettingsPanel field={selectedField} onFieldChange={onFieldChange} />

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

export function DeviceModeToggle({
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

export function MockDevicePreview({
  selectedPage,
  selectedLink,
  selectedAnalyticsLink,
  selectedForm,
  selectedFormFields,
  routing,
  links,
  settings,
  deviceMode,
  onSelectMode,
}: {
  selectedPage: MockPage;
  selectedLink: MockLinkItem;
  selectedAnalyticsLink: MockTopLinkAnalytics;
  selectedForm: MockFormTemplate;
  selectedFormFields: MockFormField[];
  routing: MockSubmissionRouting;
  links: MockLinkItem[];
  settings: DesignSettings;
  deviceMode: DeviceMode;
  onSelectMode: (mode: DeviceMode) => void;
}) {
  const isPhone = deviceMode === "phone";
  const highlightedLinkId = selectedAnalyticsLink.id || selectedLink.id;

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
                      link.id === highlightedLinkId ? "bg-foreground" : "bg-muted"
                    )}
                  />
                ))}
              </div>
              <p className="mt-2 truncate text-center text-[10px] text-muted-foreground">
                Analytics: {selectedAnalyticsLink.title}
              </p>
              <div className="mt-3 rounded-xl border bg-background p-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[11px] font-semibold">{selectedForm.title}</p>
                  <Badge variant="outline">form</Badge>
                </div>
                <div className="mt-2 grid gap-1.5">
                  {selectedFormFields.slice(0, 3).map((field) => (
                    <div key={field.id} className="rounded border bg-muted/30 px-2 py-1">
                      <p className="truncate text-[10px] text-muted-foreground">
                        {field.label || "Untitled field"}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 rounded bg-foreground px-2 py-1 text-center text-[10px] font-semibold text-background">
                  Submit mock
                </div>
                <p className="mt-1 text-center text-[10px] text-muted-foreground">no real submit</p>
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
                        link.id === highlightedLinkId ? "bg-foreground text-background" : "bg-muted/70"
                      )}
                    >
                      <p className="truncate text-[11px] font-medium">{link.title}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border bg-muted/30 p-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-semibold">{selectedForm.title}</p>
                    <Badge variant="outline">{routing.destination || "missing destination"}</Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {selectedFormFields.slice(0, 4).map((field) => (
                      <div key={field.id} className="rounded bg-background px-2 py-1">
                        <p className="truncate text-[11px] text-muted-foreground">
                          {field.label || "Untitled field"}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-semibold">Analytics highlight</p>
                      <Badge variant="outline">{selectedAnalyticsLink.ctr}</Badge>
                    </div>
                    <p className="mt-1 truncate text-[11px] text-muted-foreground">
                      {selectedAnalyticsLink.title}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
