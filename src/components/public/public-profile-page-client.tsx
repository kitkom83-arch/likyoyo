"use client";

import { useEffect, useMemo, useState } from "react";

import { PublicProfile } from "@/components/public/public-profile";
import { BuilderData } from "@/features/builder/types";
import { getHeaderLayout } from "@/features/builder/utils/header-media";
import { useI18n } from "@/i18n/use-i18n";
import { getPublicPageApiPath, splitPublicPagePath } from "@/lib/public-pages/paths";
import {
  getClickSummary,
  recordCodeCopy,
  recordDiscountModalOpen,
  recordProfileView,
  recordLinkClick,
  type ClickSummary,
} from "@/lib/local-storage/analytics-storage";
import { toProfileSlug } from "@/lib/local-storage/profile-storage";

type PublicProfilePageClientProps = {
  username: string;
  initialProfile?: BuilderData | null;
  initialProfileResolved?: boolean;
};
type HeaderLayout = NonNullable<BuilderData["header"]["layout"]>;

const EMPTY_SUMMARY: ClickSummary = {
  totalClicks: 0,
  clicksLast7Days: 0,
  clicksLast30Days: 0,
  totalViews: 0,
  totalModalOpens: 0,
  totalCtaClicks: 0,
  totalCodeCopies: 0,
};

const PUBLIC_HANDLE_PATTERN = /^[a-z0-9._-]{3,119}$/i;

const getLastPublicPathSegment = (value: string): string => {
  const parts = value.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
};

const normalizePublicHandle = (
  publicPath: string,
  ...candidates: Array<string | null | undefined>
): string => {
  const pageSlug = splitPublicPagePath(publicPath).pageSlug;
  const pageHandle = getLastPublicPathSegment(pageSlug);
  for (const candidate of [...candidates, pageHandle]) {
    if (typeof candidate !== "string") {
      continue;
    }
    const value = candidate.trim();
    if (PUBLIC_HANDLE_PATTERN.test(value) && !value.includes("/")) {
      return value;
    }
  }
  return "page";
};

const isExplicitHeaderLayout = (
  value: BuilderData["header"]["layout"],
): value is HeaderLayout =>
  value === "classic" || value === "hero" || value === "none";

const getSelectedHeaderLayout = (profile: BuilderData): HeaderLayout =>
  isExplicitHeaderLayout(profile.header.layout)
    ? profile.header.layout
    : getHeaderLayout(profile.header);

const normalizeHeaderForSlug = (slug: string, profile: BuilderData): BuilderData => {
  const pageSlug = splitPublicPagePath(slug).pageSlug || slug;
  const layout = getSelectedHeaderLayout(profile);
  return {
    ...profile,
    header: {
      ...profile.header,
      layout,
      username: pageSlug,
      publicHandle: normalizePublicHandle(
        slug,
        profile.header.publicHandle,
        profile.header.publicUsername,
        profile.header.username,
      ),
    },
  };
};

export const PublicProfilePageClient = ({
  username,
  initialProfile = null,
  initialProfileResolved = false,
}: PublicProfilePageClientProps) => {
  const { language, setLanguage, t } = useI18n();
  const slug = useMemo(() => toProfileSlug(username), [username]);
  const [mounted, setMounted] = useState(Boolean(initialProfile) || initialProfileResolved);
  const [profile, setProfile] = useState<BuilderData | null>(() =>
    initialProfile ? normalizeHeaderForSlug(toProfileSlug(username), initialProfile) : null,
  );
  const [clickSummary, setClickSummary] = useState<ClickSummary>(EMPTY_SUMMARY);

  useEffect(() => {
    if (initialProfileResolved) {
      const frameId = window.requestAnimationFrame(() => {
        if (initialProfile) {
          recordProfileView(slug);
        }
        setClickSummary(getClickSummary(slug));
      });
      return () => window.cancelAnimationFrame(frameId);
    }

    let canceled = false;
    const frameId = window.requestAnimationFrame(() => {
      const loadProfile = async () => {
        if (canceled) {
          return;
        }

        let profileData: BuilderData | null = null;
        try {
          const response = await fetch(getPublicPageApiPath(slug), {
            method: "GET",
            cache: "no-store",
          });
          if (response.ok) {
            const payload = (await response.json()) as { data?: BuilderData };
            profileData = payload?.data ?? null;
          }
        } catch {
          profileData = null;
        }

        if (canceled) {
          return;
        }
        if (profileData) {
          profileData = normalizeHeaderForSlug(slug, profileData);
          recordProfileView(slug);
        }
        setProfile(profileData);
        setClickSummary(getClickSummary(slug));
        setMounted(true);
      };
      void loadProfile();
    });

    return () => {
      canceled = true;
      window.cancelAnimationFrame(frameId);
    };
  }, [initialProfile, initialProfileResolved, slug]);

  const handlePublicLinkClick = (
    linkId: string,
    eventType: "cta" | "copy" | "modal_open" = "cta",
  ) => {
    if (eventType === "copy") {
      recordCodeCopy(slug, linkId);
    } else if (eventType === "modal_open") {
      recordDiscountModalOpen(slug, linkId);
    } else {
      recordLinkClick(slug, linkId);
    }
    setClickSummary(getClickSummary(slug));
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#e8eefc,_transparent_42%),linear-gradient(to_bottom,_var(--background),_var(--muted))]">
        <div className="mx-auto w-full max-w-[680px] space-y-4 px-4 py-8 sm:px-5 sm:py-10 md:px-6">
          <div className="ml-auto h-9 w-36 animate-pulse rounded-md border bg-card/80" />
          <div className="h-[220px] animate-pulse rounded-3xl border bg-card/65 sm:h-[260px] md:h-[300px]" />
          <div className="h-[360px] animate-pulse rounded-3xl border bg-card/55 sm:h-[420px]" />
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#e8eefc,_transparent_40%),linear-gradient(to_bottom,_var(--background),_var(--muted))] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-xl rounded-3xl border bg-card/95 p-8 text-center shadow-sm backdrop-blur">
          <div className="mb-4 flex justify-end">
            <div className="inline-flex items-center gap-1 rounded-md border border-border bg-background/70 p-1">
              <span className="px-1 text-[10px] text-muted-foreground">{t("language_switch_label")}</span>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`rounded px-2 py-1 text-xs font-medium transition ${
                  language === "en" ? "bg-primary/15 text-foreground" : "text-muted-foreground"
                }`}
              >
                {t("lang_en")}
              </button>
              <button
                type="button"
                onClick={() => setLanguage("th")}
                className={`rounded px-2 py-1 text-xs font-medium transition ${
                  language === "th" ? "bg-primary/15 text-foreground" : "text-muted-foreground"
                }`}
              >
                {t("lang_th")}
              </button>
            </div>
          </div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            {t("public_missing_title")}
          </p>
          <h1 className="mt-3 text-2xl font-semibold">{t("public_missing_heading")}</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {t("public_missing_desc", { slug })}
          </p>
        </div>
      </main>
    );
  }

  return (
    <PublicProfile
      profile={profile}
      slug={slug}
      clickSummary={clickSummary}
      onPublicLinkClick={handlePublicLinkClick}
    />
  );
};
