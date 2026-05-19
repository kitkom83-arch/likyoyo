import { Badge } from "@/components/ui/badge";

const formTemplates = [
  "Contact Form",
  "Booking Form",
  "Support Form",
  "Lead Form",
  "Custom Form",
];

const mockFields = ["text", "textarea", "select", "phone", "email", "date"];

export function FormEngineLabPreview() {
  return (
    <section className="rounded-xl border bg-background p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Form Engine
          </p>
          <h2 className="mt-2 text-lg font-semibold">Mock form builder</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Template and field planning surface only. No submission preview here calls
            /api/forms/generic-submissions or any storage backend.
          </p>
        </div>
        <Badge variant="secondary">endpoint disabled</Badge>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <section className="rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">Templates</h3>
            <Badge variant="outline">mock cards</Badge>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {formTemplates.map((template, index) => (
              <article key={template} className="rounded-lg border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold">{template}</h4>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Draft template #{index + 1} for future form engine experiments.
                    </p>
                  </div>
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    {index === 0 ? "sample" : "mock"}
                  </Badge>
                </div>
                <div className="mt-4 grid gap-2">
                  <div className="h-8 rounded bg-muted/70" />
                  <div className="h-8 rounded bg-muted/70" />
                  <div className="h-10 rounded bg-muted/70" />
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="rounded-xl border bg-background p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">Mock fields</h3>
            <Badge variant="outline">{mockFields.length} types</Badge>
          </div>
          <div className="mt-4 grid gap-3">
            {mockFields.map((field) => (
              <div key={field} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{field}</p>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    mock
                  </span>
                </div>
                <div className="mt-3 h-8 rounded bg-muted/50" />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
