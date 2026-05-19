import { mockBuilderData } from "@/features/builder/mock-data";
import { featureFlagMetadata, featureFlags } from "@/lib/feature-flags";
import { PublicResponsiveLabPreview } from "@/components/admin/lab/public-responsive-lab-preview";

const flagRows = featureFlagMetadata.map((flag) => ({
  ...flag,
  enabled: featureFlags[flag.key],
}));

export const AdminLabShell = () => {
  if (!featureFlags.uiLabMode) {
    return (
      <main className="min-h-screen bg-muted/40 px-4 py-8 text-foreground sm:px-6 lg:px-8">
        <section className="mx-auto max-w-3xl rounded-2xl border bg-background p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            UI/UX Lab
          </p>
          <h1 className="mt-2 text-2xl font-semibold">Lab mode is disabled</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Set NEXT_PUBLIC_ENABLE_UI_LAB_MODE=true in a local or Vercel Preview
            environment to open the safe lab workspace. Production admin and public pages
            remain unchanged while this flag is off.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/40 px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-5">
        <section className="rounded-2xl border bg-background p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            UI/UX Lab
          </p>
          <h1 className="mt-2 text-2xl font-semibold">Safe lab workspace</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            This page uses mock builder data only. It does not save changes, call Supabase,
            or modify public_pages.
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <PublicResponsiveLabPreview />

          <aside className="rounded-2xl border bg-background p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Current flags</h2>
            <div className="mt-4 grid gap-3">
              {flagRows.map((flag) => (
                <div key={flag.envName} className="rounded-xl border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{flag.label}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        flag.enabled
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {flag.enabled ? "on" : "off"}
                    </span>
                  </div>
                  <p className="mt-1 break-all text-xs text-muted-foreground">{flag.envName}</p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {flag.description}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="rounded-2xl border bg-background p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Mock profile source</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-xl border p-3">
              <dt className="text-xs text-muted-foreground">Slug</dt>
              <dd className="mt-1 font-medium">{mockBuilderData.header.username}</dd>
            </div>
            <div className="rounded-xl border p-3">
              <dt className="text-xs text-muted-foreground">Display name</dt>
              <dd className="mt-1 font-medium">{mockBuilderData.header.displayName}</dd>
            </div>
            <div className="rounded-xl border p-3">
              <dt className="text-xs text-muted-foreground">Header layout</dt>
              <dd className="mt-1 font-medium">{mockBuilderData.header.layout}</dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  );
};
