"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const DEFAULT_SWATCHES = [
  "#0B1222",
  "#111827",
  "#1F2937",
  "#334155",
  "#64748B",
  "#94A3B8",
  "#E2E8F0",
  "#FFFFFF",
  "#2563EB",
  "#3B82F6",
  "#0EA5E9",
  "#06B6D4",
  "#10B981",
  "#22C55E",
  "#84CC16",
  "#EAB308",
  "#F59E0B",
  "#F97316",
  "#EF4444",
  "#F43F5E",
  "#EC4899",
  "#A855F7",
  "#8B5CF6",
  "#6366F1",
];

const expandShortHex = (value: string): string =>
  `#${value
    .slice(1)
    .split("")
    .map((char) => char + char)
    .join("")}`;

const clampChannel = (value: number): number => Math.max(0, Math.min(255, value));

const channelToHex = (value: number): string =>
  clampChannel(Math.round(value)).toString(16).padStart(2, "0");

/**
 * Convert an arbitrary CSS color string into a #rrggbb value the native
 * <input type="color"> control can display. Falls back to black.
 */
const toHexForPicker = (value: string): string => {
  const input = (value ?? "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(input)) {
    return input.toLowerCase();
  }
  if (/^#[0-9a-fA-F]{3}$/.test(input)) {
    return expandShortHex(input).toLowerCase();
  }
  const rgbMatch = input.match(/rgba?\(([^)]+)\)/i);
  if (rgbMatch) {
    const parts = rgbMatch[1]
      .split(",")
      .map((part) => Number.parseFloat(part.trim()))
      .filter((part) => Number.isFinite(part));
    if (parts.length >= 3) {
      return `#${channelToHex(parts[0])}${channelToHex(parts[1])}${channelToHex(parts[2])}`;
    }
  }
  return "#000000";
};

export type ColorFieldProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  swatches?: string[];
  className?: string;
  ariaLabel?: string;
  placeholder?: string;
};

/**
 * A compact color input: swatch preview + free-form hex/rgba text field, plus a
 * collapsible panel with a native color picker and a preset palette so it stays
 * tidy until you need it.
 */
export const ColorField = ({
  id,
  value,
  onChange,
  swatches,
  className,
  ariaLabel,
  placeholder = "#000000",
}: ColorFieldProps) => {
  const [open, setOpen] = React.useState(false);
  const palette = swatches ?? DEFAULT_SWATCHES;
  const hex = toHexForPicker(value);
  const normalizedValue = (value ?? "").trim().toLowerCase();

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-label={ariaLabel ?? "Toggle color picker"}
          className="relative h-8 w-9 shrink-0 overflow-hidden rounded-lg border border-input transition hover:ring-2 hover:ring-ring/40"
          style={{
            backgroundColor: value || "transparent",
            backgroundImage:
              "linear-gradient(45deg,#0000000f 25%,transparent 25%,transparent 75%,#0000000f 75%),linear-gradient(45deg,#0000000f 25%,transparent 25%,transparent 75%,#0000000f 75%)",
            backgroundSize: "8px 8px",
            backgroundPosition: "0 0,4px 4px",
          }}
        >
          <span className="absolute inset-0" style={{ backgroundColor: value || "transparent" }} />
        </button>
        <Input
          id={id}
          value={value}
          spellCheck={false}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="font-mono text-xs uppercase"
        />
      </div>
      {open ? (
        <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={hex}
              aria-label={ariaLabel ?? "Color picker"}
              onChange={(event) => onChange(event.target.value)}
              className="h-9 w-14 cursor-pointer rounded-md border border-input bg-transparent p-0.5"
            />
            <span className="font-mono text-xs text-muted-foreground">{hex.toUpperCase()}</span>
          </div>
          <div className="grid grid-cols-8 gap-1.5">
            {palette.map((color) => {
              const selected = normalizedValue === color.toLowerCase();
              return (
                <button
                  key={color}
                  type="button"
                  title={color}
                  aria-label={color}
                  onClick={() => onChange(color)}
                  className={cn(
                    "h-6 w-full rounded-md border border-black/10 transition",
                    selected
                      ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                      : "hover:scale-110",
                  )}
                  style={{ backgroundColor: color }}
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};
