import { CheckCircle2, ClipboardCheck, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { qaChecklistGroups, qaSafetyGuardLabels } from "./mock-data";
import type { QaChecklistStatus } from "./types";

function QaStatusBadge({ status }: { status: QaChecklistStatus }) {
  if (status === "Safety guard") {
    return <Badge variant="secondary">{status}</Badge>;
  }

  if (status === "Manual check") {
    return <Badge variant="outline">{status}</Badge>;
  }

  return <Badge>{status}</Badge>;
}

export function MockQaChecklistPanel() {
  const totalItems = qaChecklistGroups.reduce((total, group) => total + group.items.length, 0);

  return (
    <section
      className="rounded-xl border bg-background p-4 shadow-sm"
      data-testid="admin-ui-v2-qa-checklist"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            QA / Regression Guard
          </p>
          <h3 className="mt-1 text-base font-semibold">Manual lab verification checklist</h3>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
            Visual checklist for the Admin UI V2 lab prototype after the refactor. It records
            expected local behavior only and does not add tests, tracking, APIs, or persistence.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            <ClipboardCheck data-icon="inline-start" />
            {totalItems} checks
          </Badge>
          <Badge variant="outline">manual QA helper</Badge>
          <Badge variant="outline">lab-only</Badge>
        </div>
      </div>

      <div className="mt-4 rounded-lg border bg-muted/30 p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-muted-foreground" />
              <p className="text-sm font-semibold">Safety guard labels</p>
            </div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              These labels are visual reminders for manual regression checks only.
            </p>
          </div>
          <div className="flex max-w-3xl flex-wrap gap-2">
            {qaSafetyGuardLabels.map((label) => (
              <Badge key={label} variant="outline">
                {label}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {qaChecklistGroups.map((group) => (
          <article key={group.title} className="rounded-lg border bg-muted/20 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-muted-foreground" />
                <p className="truncate text-sm font-semibold">{group.title}</p>
              </div>
              <Badge variant="outline">{group.items.length} item</Badge>
            </div>

            <div className="mt-3 grid gap-2">
              {group.items.map((item) => (
                <div key={item.label} className="rounded-md border bg-background/70 p-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-5">{item.label}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {item.expectedBehavior}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <QaStatusBadge status={item.status} />
                    </div>
                  </div>
                  {item.note ? (
                    <p
                      className={cn(
                        "mt-2 rounded-md border px-2 py-1 text-xs leading-5 text-muted-foreground",
                        item.status === "Safety guard" ? "bg-muted/40" : "bg-background"
                      )}
                    >
                      {item.note}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
