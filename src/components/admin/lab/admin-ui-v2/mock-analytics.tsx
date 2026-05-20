import { BarChart3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { analyticsTimeRangeOptions } from "./mock-data";
import { StaticField } from "./mock-links";
import { ChoiceGroup } from "./mock-shared";
import type {
  AnalyticsTimeRange,
  MockAnalyticsRangeData,
  MockFormAnalytics,
  MockFunnelStep,
  MockSplitItem,
  MockTopLinkAnalytics,
} from "./types";
import { formatNumber, getPercentWidth } from "./mock-utils";

export function MockAnalyticsDashboard({
  range,
  data,
  selectedTopLink,
  onRangeChange,
}: {
  range: AnalyticsTimeRange;
  data: MockAnalyticsRangeData;
  selectedTopLink: MockTopLinkAnalytics;
  onRangeChange: (range: AnalyticsTimeRange) => void;
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Analytics Dashboard
          </p>
          <h3 className="mt-1 text-base font-semibold">Mock performance overview</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Local mock analytics only. No event tracking, database read, API call, Supabase, or
            Google Sheets connection is used.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{range}</Badge>
          <Badge variant="outline">local mock analytics only</Badge>
          <Badge variant="outline">no tracking</Badge>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {data.metrics.map((metric) => (
            <div key={metric.label} className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <p className="text-xl font-semibold leading-tight">{metric.value}</p>
                <Badge variant="outline">{metric.trend}</Badge>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{metric.detail}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-muted/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Range selector
          </p>
          <div className="mt-3">
            <ChoiceGroup
              label="Time range"
              options={analyticsTimeRangeOptions}
              value={range}
              onChange={(value) => onRangeChange(value as AnalyticsTimeRange)}
            />
          </div>
          <div className="mt-4 rounded-lg border bg-background p-3">
            <p className="text-xs font-medium text-muted-foreground">Mini chart labels</p>
            <div className="mt-3 flex items-end gap-2">
              {data.miniChartLabels.map((label, index) => (
                <div key={label} className="grid flex-1 gap-1 text-center">
                  <div
                    className="mx-auto w-full rounded-t bg-foreground"
                    style={{ height: `${28 + ((index + 1) % 4) * 12}px` }}
                  />
                  <span className="truncate text-[10px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 rounded-lg border bg-background p-3">
            <p className="text-xs font-medium text-muted-foreground">Selected top link</p>
            <p className="mt-1 text-sm font-semibold">{selectedTopLink.title}</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{data.rangeInsight}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function MockTopLinksAnalytics({
  links,
  selectedTopLink,
  onSelectLink,
}: {
  links: MockTopLinkAnalytics[];
  selectedTopLink: MockTopLinkAnalytics;
  onSelectLink: (linkId: string) => void;
}) {
  const maxClicks = Math.max(...links.map((link) => link.clicks), 1);

  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Top Links
          </p>
          <h3 className="mt-1 text-base font-semibold">Mock link performance</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Selecting a row updates only local analytics detail and preview highlight state.
          </p>
        </div>
        <Badge variant="outline">no event tracking</Badge>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-3">
          {links.map((link) => {
            const selected = selectedTopLink.id === link.id;

            return (
              <button
                key={link.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onSelectLink(link.id)}
                className={cn(
                  "min-w-0 rounded-lg border p-3 text-left transition-colors",
                  selected
                    ? "border-foreground bg-foreground text-background"
                    : "bg-muted/30 hover:bg-muted/60"
                )}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{link.title}</p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-background/60">
                      <div
                        className={cn("h-full rounded-full", selected ? "bg-background" : "bg-foreground")}
                        style={{ width: getPercentWidth(link.clicks, maxClicks) }}
                      />
                    </div>
                  </div>
                  <div className="grid shrink-0 grid-cols-2 gap-2 text-xs md:grid-cols-5">
                    <Badge variant={selected ? "secondary" : "outline"}>{formatNumber(link.clicks)} clicks</Badge>
                    <Badge variant={selected ? "secondary" : "outline"}>{formatNumber(link.views)} views</Badge>
                    <Badge variant={selected ? "secondary" : "outline"}>{link.ctr} CTR</Badge>
                    <Badge variant={selected ? "secondary" : "outline"}>{link.conversions} conv.</Badge>
                    <Badge variant={selected ? "secondary" : "outline"}>{link.trend}</Badge>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border bg-muted/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Analytics detail
          </p>
          <h4 className="mt-2 text-base font-semibold">{selectedTopLink.title}</h4>
          <div className="mt-3 grid gap-2">
            <StaticField label="Clicks" value={formatNumber(selectedTopLink.clicks)} />
            <StaticField label="CTR" value={selectedTopLink.ctr} />
            <StaticField label="Conversions" value={formatNumber(selectedTopLink.conversions)} />
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{selectedTopLink.insight}</p>
        </div>
      </div>
    </section>
  );
}

export function MockFormAnalyticsPanel({ forms }: { forms: MockFormAnalytics[] }) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Form Analytics
          </p>
          <h3 className="mt-1 text-base font-semibold">Visual-only form performance</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Form metrics are mock values and do not read real submissions.
          </p>
        </div>
        <Badge variant="outline">no database read</Badge>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-5">
        {forms.map((form) => (
          <article key={form.id} className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 truncate text-sm font-semibold">{form.title}</p>
              <Badge variant="outline">{form.destination}</Badge>
            </div>
            <div className="mt-3 grid gap-2 text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Views</span>
                <span className="font-medium">{formatNumber(form.views)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Starts</span>
                <span className="font-medium">{formatNumber(form.starts)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Submissions</span>
                <span className="font-medium">{formatNumber(form.submissions)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-medium">{form.completionRate}</span>
              </div>
            </div>
            <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">
              {form.dropOffHint}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function MockSplitBars({
  title,
  items,
}: {
  title: string;
  items: MockSplitItem[];
}) {
  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </p>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{item.label}</span>
              <span className="text-muted-foreground">{item.value}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
              <div className="h-full rounded-full bg-foreground" style={{ width: `${item.value}%` }} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MockTrafficDeviceRegionPanel({ data }: { data: MockAnalyticsRangeData }) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Traffic / Device / Region
          </p>
          <h3 className="mt-1 text-base font-semibold">CSS-only split views</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            These bars are visual mock data, not external analytics or tracking.
          </p>
        </div>
        <Badge variant="outline">no tracking</Badge>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <MockSplitBars title="Traffic sources" items={data.trafficSources} />
        <MockSplitBars title="Device split" items={data.deviceSplit} />
        <MockSplitBars title="Region split" items={data.regionSplit} />
      </div>
    </section>
  );
}

export function MockConversionFunnel({ steps }: { steps: MockFunnelStep[] }) {
  const maxValue = Math.max(...steps.map((step) => step.value), 1);

  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Conversion Funnel
          </p>
          <h3 className="mt-1 text-base font-semibold">Mock funnel progression</h3>
        </div>
        <Badge variant="outline">local percentages only</Badge>
      </div>

      <div className="mt-4 grid gap-3">
        {steps.map((step) => (
          <div key={step.label} className="rounded-lg border bg-muted/30 p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">{step.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatNumber(step.value)} mock events
                </p>
              </div>
              <Badge variant="outline">{step.percent}</Badge>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-foreground"
                style={{ width: getPercentWidth(step.value, maxValue) }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MockInsightsPanel({
  insights,
  selectedTopLink,
  range,
}: {
  insights: string[];
  selectedTopLink: MockTopLinkAnalytics;
  range: AnalyticsTimeRange;
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Insights
          </p>
          <h3 className="mt-1 text-base font-semibold">Generated-looking mock notes</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Static local copy only. No AI, API, analytics service, or database call runs here.
          </p>
        </div>
        <Badge variant="secondary">{range}</Badge>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {insights.map((insight) => (
          <article key={insight} className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-start gap-2">
              <BarChart3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p className="text-sm leading-6">{insight}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 rounded-lg border bg-muted/30 p-3">
        <p className="text-xs font-medium text-muted-foreground">Selected link insight</p>
        <p className="mt-1 text-sm leading-6">{selectedTopLink.insight}</p>
      </div>
    </section>
  );
}
