import { ImageIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { buttonStyles, lockTypeOptions } from "./mock-data";
import {
  AlignmentChoice,
  ChoiceGroup,
  MockInput,
  MockStatsGrid,
  MockTextarea,
  MockToggle,
  MockValidationHints,
} from "./mock-shared";
import type {
  ButtonStyle,
  DesignSettings,
  LockType,
  MockLinkItem,
  UpdateDesignSetting,
  UpdateSelectedLink,
} from "./types";
import {
  getAlignClass,
  getJustifyClass,
  getStyleLabel,
} from "./mock-utils";

export function PerLinkSettingsPanel({
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

export function ButtonStyleSelector({
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

export function DesignPanel({
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

export function StyleSpecificFields({
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

export function StylePreview({
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

export function StaticField({
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
