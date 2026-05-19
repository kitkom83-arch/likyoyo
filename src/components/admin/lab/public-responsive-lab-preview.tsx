"use client";

import { Monitor, Smartphone } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockBuilderData } from "@/features/builder/mock-data";
import { BioLink } from "@/features/builder/types";
import { cn } from "@/lib/utils";

type PreviewMode = "phone" | "pc";

const modeOptions: Array<{
  value: PreviewMode;
  label: string;
  icon: typeof Smartphone;
}> = [
  { value: "phone", label: "Phone", icon: Smartphone },
  { value: "pc", label: "PC", icon: Monitor },
];

const getLinkLabel = (link: BioLink) => {
  if (link.contentType === "discount") {
    return link.discount?.cardTitle || link.title;
  }

  if (link.contentType === "promo_gallery") {
    return link.promoGallery?.title || link.title;
  }

  if (link.contentType === "external_form") {
    return link.externalForm?.title || link.title;
  }

  return link.title;
};

const getLinkDescription = (link: BioLink) => {
  if (link.contentType === "discount") {
    return link.discount?.modalDescription || link.description;
  }

  if (link.contentType === "promo_gallery") {
    return link.promoGallery?.description || link.description;
  }

  if (link.contentType === "external_form") {
    return link.externalForm?.description || link.description;
  }

  return link.description;
};

const getLinkTypeLabel = (link: BioLink) => {
  switch (link.contentType) {
    case "discount":
      return "Offer";
    case "promo_gallery":
      return "Gallery";
    case "external_form":
      return "Form preview";
    case "embed_post":
      return "Embed";
    case "form":
      return "Form preview";
    default:
      return "Link";
  }
};

const getVisualUrl = (link: BioLink) =>
  link.settings.backgroundImageUrl ||
  link.settings.imageUrl ||
  link.settings.iconImageUrl ||
  link.settings.thumbnailUrl ||
  link.discount?.cardThumbnail ||
  link.promoGallery?.items[0]?.imageUrl ||
  "";

const enabledLinks = mockBuilderData.links.filter((link) => link.enabled);
const socials = mockBuilderData.socials.filter((social) => social.enabled);

function ProfileHeader({ compact = false }: { compact?: boolean }) {
  const { header, text } = mockBuilderData;

  return (
    <div className={cn("grid gap-4", compact ? "text-center" : "content-start")}>
      <div
        className={cn(
          "overflow-hidden border bg-background shadow-sm",
          compact ? "mx-auto size-20 rounded-full" : "h-56 rounded-xl"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={compact ? header.avatarUrl : header.heroImageUrl || header.avatarUrl}
          alt=""
          className="size-full object-cover"
        />
      </div>

      <div className={compact ? "grid justify-items-center gap-2" : "grid gap-3"}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            @{header.publicHandle || header.username}
          </p>
          <h3 className={cn("font-semibold leading-tight", compact ? "text-xl" : "text-3xl")}>
            {header.displayName}
          </h3>
        </div>
        <p className={cn("text-sm leading-6 text-muted-foreground", compact ? "max-w-64" : "max-w-sm")}>
          {header.tagline}
        </p>
        {!compact ? (
          <p className="max-w-md text-sm leading-6 text-muted-foreground">{text.intro}</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {socials.map((social) => (
            <Badge key={social.id} variant="secondary" className="capitalize">
              {social.platform}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

function PhoneLinkButton({ link }: { link: BioLink }) {
  const visualUrl = getVisualUrl(link);

  return (
    <div className="grid min-h-16 grid-cols-[44px_minmax(0,1fr)] items-center gap-3 rounded-xl border bg-background p-3 shadow-sm">
      <div className="size-11 overflow-hidden rounded-lg bg-muted">
        {visualUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={visualUrl} alt="" className="size-full object-cover" />
        ) : null}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">{getLinkLabel(link)}</p>
          {link.settings.prioritize ? <Badge className="h-4 px-1.5 text-[10px]">Top</Badge> : null}
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {getLinkDescription(link)}
        </p>
      </div>
    </div>
  );
}

function PcContentCard({ link }: { link: BioLink }) {
  const visualUrl = getVisualUrl(link);

  return (
    <div className="grid gap-3 rounded-xl border bg-background p-4 shadow-sm">
      {visualUrl ? (
        <div className="h-28 overflow-hidden rounded-lg bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={visualUrl} alt="" className="size-full object-cover" />
        </div>
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Badge variant="outline">{getLinkTypeLabel(link)}</Badge>
          <h4 className="mt-2 text-base font-semibold leading-tight">{getLinkLabel(link)}</h4>
        </div>
        {link.settings.prioritize ? <Badge>Top</Badge> : null}
      </div>
      <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{getLinkDescription(link)}</p>
      <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
        Static lab preview only
      </div>
    </div>
  );
}

function PhonePreview() {
  return (
    <div className="mx-auto w-full max-w-[390px] rounded-[2rem] border bg-zinc-950 p-3 shadow-xl">
      <div className="min-h-[720px] overflow-hidden rounded-[1.5rem] bg-muted/40">
        <div className="grid gap-5 px-4 py-6">
          <ProfileHeader compact />
          <div className="grid gap-3">
            {enabledLinks.map((link) => (
              <PhoneLinkButton key={link.id} link={link} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PcPreview() {
  const primaryLinks = enabledLinks.slice(0, 2);
  const contentLinks = enabledLinks.slice(2);

  return (
    <div className="overflow-hidden rounded-2xl border bg-muted/30 p-5 shadow-sm">
      <div className="grid min-h-[620px] gap-5 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.3fr)]">
        <aside className="rounded-xl border bg-background p-6">
          <ProfileHeader />
          <div className="mt-8 grid gap-3">
            {primaryLinks.map((link) => (
              <div key={link.id} className="rounded-xl border bg-muted/30 p-4">
                <p className="text-sm font-semibold">{getLinkLabel(link)}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{getLinkDescription(link)}</p>
              </div>
            ))}
          </div>
        </aside>

        <section className="grid content-start gap-4">
          <div className="rounded-xl border bg-background p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Links / Forms / Content
            </p>
            <h3 className="mt-2 text-2xl font-semibold">Desktop content column</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {contentLinks.map((link) => (
              <PcContentCard key={link.id} link={link} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function PublicResponsiveLabPreview() {
  const [mode, setMode] = useState<PreviewMode>("phone");
  const Preview = useMemo(() => (mode === "phone" ? PhonePreview : PcPreview), [mode]);

  return (
    <section className="rounded-2xl border bg-background p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Public Responsive V2
          </p>
          <h2 className="mt-2 text-lg font-semibold">Lab-only preview</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Mock builder data renders in isolated phone and PC previews without saving,
            submitting forms, or using the production public renderer.
          </p>
        </div>

        <div className="inline-flex w-fit rounded-lg border bg-muted/40 p-1">
          {modeOptions.map((option) => {
            const Icon = option.icon;
            const selected = mode === option.value;

            return (
              <Button
                key={option.value}
                type="button"
                variant={selected ? "default" : "ghost"}
                size="sm"
                aria-pressed={selected}
                onClick={() => setMode(option.value)}
              >
                <Icon data-icon="inline-start" />
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <Preview />
      </div>
    </section>
  );
}
