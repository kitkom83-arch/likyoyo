import { Badge } from "@/components/ui/badge";

const metricCards = [
  { label: "Views", value: "12,840", detail: "+8.2% mock week" },
  { label: "Clicks", value: "2,176", detail: "Top mock link included" },
  { label: "CTR", value: "16.9%", detail: "Calculated from mock totals" },
];

const topLinks = [
  { label: "VIP Menu", clicks: 684 },
  { label: "Booking Offer", clicks: 531 },
  { label: "Support Request", clicks: 296 },
];

const deviceSplit = [
  { label: "Phone", value: "72%" },
  { label: "PC", value: "21%" },
  { label: "Tablet", value: "7%" },
];

export function AnalyticsLabPreview() {
  return (
    <section className="rounded-xl border bg-background p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Analytics
          </p>
          <h2 className="mt-2 text-lg font-semibold">Mock analytics dashboard</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Static planning view for future analytics UX. It does not call Supabase,
            analytics storage, or production tracking tables.
          </p>
        </div>
        <Badge variant="secondary">mock data only</Badge>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {metricCards.map((metric) => (
          <article key={metric.label} className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">{metric.value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{metric.detail}</p>
          </article>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-xl border p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">Top Links</h3>
            <Badge variant="outline">sample ranking</Badge>
          </div>
          <div className="mt-4 grid gap-3">
            {topLinks.map((link, index) => (
              <div key={link.label} className="grid grid-cols-[32px_minmax(0,1fr)_72px] items-center gap-3">
                <span className="rounded-full bg-muted px-2 py-1 text-center text-xs font-semibold">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{link.label}</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground"
                      style={{ width: `${Math.max(18, (link.clicks / topLinks[0].clicks) * 100)}%` }}
                    />
                  </div>
                </div>
                <p className="text-right text-sm font-semibold">{link.clicks}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-xl border p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">Device Split</h3>
            <Badge variant="outline">mock</Badge>
          </div>
          <div className="mt-4 grid gap-3">
            {deviceSplit.map((device) => (
              <div key={device.label} className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <p className="font-medium">{device.label}</p>
                  <p className="font-semibold">{device.value}</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
                  <div className="h-full rounded-full bg-foreground" style={{ width: device.value }} />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
