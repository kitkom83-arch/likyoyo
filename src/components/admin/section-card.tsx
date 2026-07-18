"use client";

import { ReactNode, useEffect } from "react";
import { Minus, Plus } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSectionCollapse } from "@/components/admin/section-collapse-context";
import { useI18n } from "@/i18n/use-i18n";

type SectionCardProps = {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
};

export const SectionCard = ({ id, title, description, children }: SectionCardProps) => {
  const { t } = useI18n();
  const collapse = useSectionCollapse();

  useEffect(() => {
    collapse?.register(id);
  }, [collapse, id]);

  const collapsed = collapse ? collapse.isCollapsed(id) : false;
  const toggleable = Boolean(collapse);

  return (
    <Card
      id={id}
      className="scroll-mt-24 overflow-hidden border border-border/70 bg-background/95 shadow-sm"
    >
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-muted/35 to-muted/10 pb-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-sm font-semibold tracking-[0.01em] sm:text-[15px]">
              {title}
            </CardTitle>
            {!collapsed ? (
              <CardDescription className="text-[11px] leading-5 text-muted-foreground/90 sm:text-xs">
                {description}
              </CardDescription>
            ) : null}
          </div>
          {toggleable ? (
            <button
              type="button"
              onClick={() => collapse?.toggle(id)}
              aria-expanded={!collapsed}
              aria-label={collapsed ? t("sections_expand") : t("sections_collapse")}
              title={collapsed ? t("sections_expand") : t("sections_collapse")}
              className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background/80 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {collapsed ? <Plus className="size-4" /> : <Minus className="size-4" />}
            </button>
          ) : null}
        </div>
      </CardHeader>
      {!collapsed ? (
        <CardContent className="space-y-4 p-3.5 sm:p-4">{children}</CardContent>
      ) : null}
    </Card>
  );
};
