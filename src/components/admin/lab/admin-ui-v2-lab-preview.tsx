import { Badge } from "@/components/ui/badge";

const adminNavItems = ["Pages", "Blocks", "Design", "Forms", "Settings"];

const mockBlocks = [
  { label: "Hero header", status: "Pinned", detail: "Avatar, handle, tagline" },
  { label: "Featured links", status: "Draft", detail: "4 enabled mock cards" },
  { label: "Contact capture", status: "Mock", detail: "No submission endpoint" },
];

export function AdminUiV2LabPreview() {
  return (
    <section className="rounded-xl border bg-background p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Admin UI V2
          </p>
          <h2 className="mt-2 text-lg font-semibold">Mock editor layout</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Static lab concept with mock navigation, editor panels, and inspector space. It
            does not import AdminShell and has no save or publish action.
          </p>
        </div>
        <Badge variant="secondary">mock only</Badge>
      </div>

      <div className="mt-5 grid min-h-[620px] overflow-hidden rounded-xl border bg-muted/30 lg:grid-cols-[210px_minmax(0,1fr)_320px]">
        <aside className="border-b bg-background p-4 lg:border-b-0 lg:border-r">
          <div className="rounded-lg border bg-muted/40 px-3 py-2">
            <p className="text-sm font-semibold">Likyoyo Admin</p>
            <p className="mt-1 text-xs text-muted-foreground">Lab shell preview</p>
          </div>
          <nav className="mt-4 grid gap-2" aria-label="Mock admin navigation">
            {adminNavItems.map((item, index) => (
              <div
                key={item}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  index === 0 ? "bg-foreground text-background" : "bg-muted/50 text-foreground"
                }`}
              >
                {item}
              </div>
            ))}
          </nav>
        </aside>

        <section className="grid content-start gap-4 border-b p-4 lg:border-b-0 lg:border-r">
          <div className="rounded-lg border bg-background p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Page editor</p>
                <p className="mt-1 text-xs text-muted-foreground">Mock drag surface</p>
              </div>
              <Badge variant="outline">unsaved disabled</Badge>
            </div>
          </div>
          <div className="grid gap-3">
            {mockBlocks.map((block) => (
              <article key={block.label} className="rounded-lg border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold">{block.label}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{block.detail}</p>
                  </div>
                  <Badge variant="secondary">{block.status}</Badge>
                </div>
                <div className="mt-4 h-16 rounded-lg bg-muted/60" />
              </article>
            ))}
          </div>
        </section>

        <aside className="grid content-start gap-4 bg-background p-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm font-semibold">Preview</p>
            <div className="mt-3 rounded-lg border bg-muted/40 p-3">
              <div className="mx-auto h-44 max-w-36 rounded-xl border bg-background p-3">
                <div className="mx-auto size-10 rounded-full bg-muted" />
                <div className="mt-3 h-2 rounded bg-muted" />
                <div className="mt-2 h-2 rounded bg-muted" />
                <div className="mt-5 grid gap-2">
                  <div className="h-8 rounded bg-muted" />
                  <div className="h-8 rounded bg-muted" />
                  <div className="h-8 rounded bg-muted" />
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm font-semibold">Inspector</p>
            <dl className="mt-3 grid gap-3 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Target</dt>
                <dd className="font-medium">Hero header</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Mode</dt>
                <dd className="font-medium">Read-only</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Source</dt>
                <dd className="font-medium">Mock data</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </section>
  );
}
