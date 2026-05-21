"use client";

import Link from "next/link";
import { ExternalLink, Image as ImageIcon, Link2 } from "lucide-react";
import { type MouseEvent, useCallback, useEffect, useMemo, useState } from "react";

import { AnalyticsSummaryCard } from "@/components/admin/analytics-summary-card";
import { DataToolsCard } from "@/components/admin/data-tools-card";
import { SavedProfilesManagerCard } from "@/components/admin/saved-profiles-manager-card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BuilderData } from "@/features/builder/types";
import { useI18n } from "@/i18n/use-i18n";
import { AdminMe, PublicPageListItem } from "@/lib/public-pages/public-pages-client";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  currentSlug: string;
  adminMe?: AdminMe | null;
  isSwitchingWorkspace?: boolean;
  onSwitchWorkspace?: (slug: string, options?: { fallbackData?: BuilderData; markUnsaved?: boolean }) => Promise<"remote" | "fallback">;
  savedProfiles?: PublicPageListItem[];
  savedPagesError?: string | null;
  onRefreshSavedPages?: () => Promise<PublicPageListItem[] | null>;
};

export const AdminSidebar = ({
  currentSlug,
  adminMe,
  isSwitchingWorkspace = false,
  onSwitchWorkspace,
  savedProfiles,
  savedPagesError,
  onRefreshSavedPages,
}: AdminSidebarProps) => (
    <AdminSidebarContent
      currentSlug={currentSlug}
      adminMe={adminMe}
      isSwitchingWorkspace={isSwitchingWorkspace}
    onSwitchWorkspace={onSwitchWorkspace}
    savedProfiles={savedProfiles}
    savedPagesError={savedPagesError}
    onRefreshSavedPages={onRefreshSavedPages}
  />
);

const AdminSidebarContent = ({
  currentSlug,
  adminMe,
  isSwitchingWorkspace = false,
  onSwitchWorkspace,
  savedProfiles,
  savedPagesError,
  onRefreshSavedPages,
}: AdminSidebarProps) => {
  const { t } = useI18n();
  const SECTION_ITEMS = useMemo(
    () => [
      { id: "profile", targetId: "header", label: t("sidebar_section_header") },
      { id: "wallpaper", targetId: "wallpaper", label: t("sidebar_section_wallpaper") },
      { id: "text", targetId: "text", label: t("sidebar_section_text") },
      { id: "buttons", targetId: "buttons", label: t("sidebar_section_buttons") },
      { id: "social-links", targetId: "social-icons", label: t("sidebar_section_social") },
      { id: "links", targetId: "links", label: t("sidebar_section_links") },
    ],
    [t],
  );
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(SECTION_ITEMS[0].id);
  const publicPath = `/${currentSlug}`;
  const publicUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return publicPath;
    }
    return `${window.location.origin}${publicPath}`;
  }, [publicPath]);

  const handleCopy = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const scrollToSection = useCallback((sectionId: string) => {
    const section = SECTION_ITEMS.find(
      (item) => item.id === sectionId || item.targetId === sectionId,
    );
    const target = section ? document.getElementById(section.targetId) : null;
    if (!section || !target) {
      return;
    }

    setActiveSection(section.id);
    target.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [SECTION_ITEMS]);

  const handleSectionClick = (
    event: MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    event.preventDefault();
    scrollToSection(sectionId);
    window.history.pushState(null, "", `#${sectionId}`);
  };

  useEffect(() => {
    const setActiveFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash) {
        return;
      }

      scrollToSection(hash);
    };

    const hashFrameId = window.requestAnimationFrame(setActiveFromHash);

    const observedSections = SECTION_ITEMS.map((item) =>
      document.getElementById(item.targetId),
    ).filter(Boolean) as HTMLElement[];
    const sectionIdByTargetId = new Map(
      SECTION_ITEMS.map((item) => [item.targetId, item.id]),
    );

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const topEntry = intersecting[0];
        if (topEntry) {
          setActiveSection(sectionIdByTargetId.get(topEntry.target.id) ?? topEntry.target.id);
        }
      },
      {
        threshold: [0.2, 0.45, 0.7],
        rootMargin: "-18% 0px -58% 0px",
      },
    );

    observedSections.forEach((section) => observer.observe(section));
    window.addEventListener("hashchange", setActiveFromHash);

    return () => {
      window.cancelAnimationFrame(hashFrameId);
      observer.disconnect();
      window.removeEventListener("hashchange", setActiveFromHash);
    };
  }, [SECTION_ITEMS, scrollToSection]);

  return (
    <aside className="rounded-2xl border border-border/60 bg-gradient-to-b from-background/95 to-muted/35 p-4 shadow-sm sm:p-5">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t("sidebar_brand_builder")}</p>
        <h1 className="text-2xl font-semibold">{t("sidebar_page_editor")}</h1>
        <Badge variant="secondary" className="rounded-full">
          {t("sidebar_live_preview")}
        </Badge>
      </div>

      <Separator className="my-4" />

      <nav className="space-y-1.5 rounded-xl border border-border/60 bg-muted/20 p-2">
        {SECTION_ITEMS.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(event) => handleSectionClick(event, item.id)}
            className={cn(
              "relative block rounded-lg px-3 py-2 text-sm font-medium transition",
              activeSection === item.id
                ? "bg-primary/20 pl-4 text-primary ring-1 ring-primary/50 shadow-[0_0_0_1px_rgba(59,130,246,0.12)] before:absolute before:inset-y-1 before:left-1 before:w-1 before:rounded-full before:bg-primary"
                : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
            )}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <Separator className="my-4" />

      <div className="space-y-2 text-sm text-muted-foreground">
        <p>{t("sidebar_public_route")}</p>
        <Link className="text-foreground underline underline-offset-4" href={publicPath}>
          {publicPath}
        </Link>
      </div>

      <div className="mt-4 space-y-2">
        {adminMe?.user.role === "owner" ? (
          <Button
            className="w-full justify-start"
            variant="outline"
            onClick={() => {
              window.location.href = "/admin/owner";
            }}
          >
            Owner Control
          </Button>
        ) : null}
        <Button className="w-full justify-start" variant="secondary" onClick={handleCopy}>
          <Link2 className="size-4" />
          {copied ? t("sidebar_copied") : t("sidebar_copy_public_link")}
        </Button>
        <Button
          className="w-full justify-start"
          variant="outline"
          onClick={() => window.open(publicPath, "_blank", "noopener,noreferrer")}
        >
          <ExternalLink className="size-4" />
          {t("sidebar_open_public_page")}
        </Button>
        <a
          className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start")}
          href="https://img.bn9.one/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ImageIcon className="size-4" />
          {t("sidebar_image_url_tool")}
        </a>
      </div>

      <div className="mt-5 space-y-3 border-t border-border/60 pt-4">
        <SavedProfilesManagerCard
          currentSlug={currentSlug}
          adminMe={adminMe}
          isSwitchingWorkspace={isSwitchingWorkspace}
          onSwitchWorkspace={onSwitchWorkspace}
          savedProfiles={savedProfiles}
          savedPagesError={savedPagesError}
          onRefreshSavedPages={onRefreshSavedPages}
        />
        <AnalyticsSummaryCard currentSlug={currentSlug} />
        <DataToolsCard currentSlug={currentSlug} adminScopeKey={adminMe?.user.adminId ?? null} />
      </div>
    </aside>
  );
};
