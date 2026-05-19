import { mockBuilderData } from "@/features/builder/mock-data";
import { featureFlagMetadata, featureFlags } from "@/lib/feature-flags";
import { LabWorkspaceTabs } from "@/components/admin/lab/lab-workspace-tabs";

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
        <section className="rounded-xl border bg-background p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                UI/UX Lab
              </p>
              <h1 className="mt-2 text-2xl font-semibold">Safe experiment workspace</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                This page is the mock-only home for future UI and workflow ideas. It does
                not save changes, call Supabase, call Google Sheets, or modify production
                admin and public pages.
              </p>
            </div>
            <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm">
              <p className="font-medium">Mock profile source</p>
              <p className="mt-1 text-xs text-muted-foreground">
                @{mockBuilderData.header.username} · {mockBuilderData.header.displayName} ·{" "}
                {mockBuilderData.header.layout}
              </p>
            </div>
          </div>
        </section>

        <LabWorkspaceTabs flagRows={flagRows} />
      </div>
    </main>
  );
};
