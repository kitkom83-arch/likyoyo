import { Badge } from "@/components/ui/badge";

type SafetyNotesLabProps = {
  flagRows: Array<{
    envName: string;
    label: string;
    enabled: boolean;
  }>;
};

const safetyNotes = [
  "mock only",
  "no Supabase calls",
  "no Google Sheets calls",
  "no support form changes",
  "no public renderer changes",
  "no save/publish",
  "production flags remain off",
];

export function SafetyNotesLab({ flagRows }: SafetyNotesLabProps) {
  return (
    <section className="rounded-xl border bg-background p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Safety Notes
          </p>
          <h2 className="mt-2 text-lg font-semibold">Isolated lab contract</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            The lab is a local and preview-only workspace for mock experiments. Production
            behavior stays unchanged while release flags remain disabled.
          </p>
        </div>
        <Badge variant="secondary">no save / no publish</Badge>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-3 sm:grid-cols-2">
          {safetyNotes.map((note) => (
            <div key={note} className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm font-semibold">{note}</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                This lab panel is static and does not wire to production workflows.
              </p>
            </div>
          ))}
        </div>

        <aside className="rounded-xl border p-4">
          <h3 className="text-sm font-semibold">Production flags</h3>
          <div className="mt-4 grid gap-3">
            {flagRows.map((flag) => (
              <div key={flag.envName} className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{flag.label}</p>
                  <Badge variant={flag.enabled ? "default" : "secondary"}>
                    {flag.enabled ? "on" : "off"}
                  </Badge>
                </div>
                <p className="mt-1 break-all text-xs text-muted-foreground">{flag.envName}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
