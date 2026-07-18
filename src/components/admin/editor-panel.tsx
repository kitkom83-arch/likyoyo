"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ChevronsDownUp, ChevronsUpDown, PanelTopClose } from "lucide-react";

import { ButtonsSection } from "@/components/admin/sections/buttons-section";
import { HeaderSection } from "@/components/admin/sections/header-section";
import { LinksSection } from "@/components/admin/sections/links-section";
import { SocialIconsSection } from "@/components/admin/sections/social-icons-section";
import { TextSection } from "@/components/admin/sections/text-section";
import { WallpaperSection } from "@/components/admin/sections/wallpaper-section";
import {
  SectionCollapseContext,
  SectionCollapseContextValue,
} from "@/components/admin/section-collapse-context";
import { useI18n } from "@/i18n/use-i18n";

type EditorPanelProps = {
  slugCollisionWarning?: string | null;
};

export const EditorPanel = ({ slugCollisionWarning }: EditorPanelProps) => {
  const { t } = useI18n();
  const orderRef = useRef<string[]>([]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const register = useCallback((id: string) => {
    if (!orderRef.current.includes(id)) {
      orderRef.current = [...orderRef.current, id];
    }
  }, []);

  const toggle = useCallback((id: string) => {
    setCollapsed((current) => ({ ...current, [id]: !current[id] }));
  }, []);

  const isCollapsed = useCallback((id: string) => Boolean(collapsed[id]), [collapsed]);

  const expandAll = useCallback(() => setCollapsed({}), []);

  const collapseAll = useCallback(() => {
    setCollapsed(
      orderRef.current.reduce<Record<string, boolean>>((acc, id) => {
        acc[id] = true;
        return acc;
      }, {}),
    );
  }, []);

  const collapseExceptFirst = useCallback(() => {
    setCollapsed(
      orderRef.current.reduce<Record<string, boolean>>((acc, id, index) => {
        acc[id] = index !== 0;
        return acc;
      }, {}),
    );
  }, []);

  const contextValue = useMemo<SectionCollapseContextValue>(
    () => ({ isCollapsed, toggle, register }),
    [isCollapsed, toggle, register],
  );

  return (
    <SectionCollapseContext.Provider value={contextValue}>
      <section className="space-y-4 rounded-2xl border border-border/60 bg-gradient-to-b from-background/90 to-muted/20 p-2.5 sm:space-y-5 sm:p-3.5 lg:space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-background/80 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <ChevronsUpDown className="size-3.5" />
            {t("sections_expand_all")}
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-background/80 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <ChevronsDownUp className="size-3.5" />
            {t("sections_collapse_all")}
          </button>
          <button
            type="button"
            onClick={collapseExceptFirst}
            className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-background/80 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <PanelTopClose className="size-3.5" />
            {t("sections_only_top")}
          </button>
        </div>
        <HeaderSection slugCollisionWarning={slugCollisionWarning} />
        <WallpaperSection />
        <TextSection />
        <ButtonsSection />
        <SocialIconsSection />
        <LinksSection />
      </section>
    </SectionCollapseContext.Provider>
  );
};
