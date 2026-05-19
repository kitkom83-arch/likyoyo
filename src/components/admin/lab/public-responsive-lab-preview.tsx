"use client";

import {
  CalendarDays,
  Image as ImageIcon,
  Mail,
  MessageSquareText,
  Monitor,
  MousePointerClick,
  Send,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
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

const styleSamples: Array<{
  label: string;
  description: string;
  style: "icon-left" | "image-full" | "text-only" | "card-left-image" | "text-panel";
  icon: LucideIcon;
}> = [
  {
    label: "icon-left",
    description: "Compact action with a leading icon.",
    style: "icon-left",
    icon: MousePointerClick,
  },
  {
    label: "image-full",
    description: "Full-bleed visual card for campaigns.",
    style: "image-full",
    icon: ImageIcon,
  },
  {
    label: "text-only",
    description: "Simple fast link for low-friction lists.",
    style: "text-only",
    icon: Send,
  },
  {
    label: "card-left-image",
    description: "Media thumbnail plus short supporting text.",
    style: "card-left-image",
    icon: Sparkles,
  },
  {
    label: "text-panel",
    description: "Editorial block for longer instructions.",
    style: "text-panel",
    icon: MessageSquareText,
  },
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
const featuredLink = enabledLinks.find((link) => link.settings.prioritize) ?? enabledLinks[0];
const visualLink = enabledLinks.find((link) => getVisualUrl(link)) ?? featuredLink;
const heroImageUrl = mockBuilderData.header.heroImageUrl || mockBuilderData.header.avatarUrl;

function LabImage({ src, className }: { src: string; className: string }) {
  if (!src) {
    return <div className={cn("bg-muted", className)} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={className} />
  );
}

function SocialBadges({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("flex flex-wrap gap-2", compact ? "justify-center" : "")}>
      {socials.slice(0, compact ? 3 : 5).map((social) => (
        <Badge key={social.id} variant="secondary" className="capitalize">
          {social.platform}
        </Badge>
      ))}
    </div>
  );
}

function PhoneHero() {
  const { header } = mockBuilderData;

  return (
    <section className="overflow-hidden rounded-2xl border bg-background shadow-sm">
      <div className="relative h-36 bg-muted">
        <LabImage src={heroImageUrl} className="size-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-background to-transparent" />
      </div>
      <div className="-mt-9 grid justify-items-center gap-3 px-4 pb-5 text-center">
        <div className="size-20 overflow-hidden rounded-full border-4 border-background bg-muted shadow-sm">
          <LabImage src={header.avatarUrl} className="size-full object-cover" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            @{header.publicHandle || header.username}
          </p>
          <h3 className="mt-1 text-xl font-semibold leading-tight">{header.displayName}</h3>
          <p className="mt-2 text-sm leading-5 text-muted-foreground">{header.tagline}</p>
        </div>
        <SocialBadges compact />
      </div>
    </section>
  );
}

function PhoneLinkButton({ link, featured = false }: { link: BioLink; featured?: boolean }) {
  const visualUrl = getVisualUrl(link);

  return (
    <div
      className={cn(
        "grid min-h-16 grid-cols-[46px_minmax(0,1fr)] items-center gap-3 rounded-2xl border bg-background p-3 shadow-sm",
        featured ? "border-foreground/20 bg-foreground text-background" : ""
      )}
    >
      <div className={cn("size-11 overflow-hidden rounded-xl bg-muted", featured ? "bg-background/20" : "")}>
        {visualUrl ? <LabImage src={visualUrl} className="size-full object-cover" /> : null}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">{getLinkLabel(link)}</p>
          {link.settings.prioritize ? (
            <Badge variant={featured ? "secondary" : "default"} className="h-4 px-1.5 text-[10px]">
              Top
            </Badge>
          ) : null}
        </div>
        <p
          className={cn(
            "mt-0.5 line-clamp-2 text-xs leading-5",
            featured ? "text-background/75" : "text-muted-foreground"
          )}
        >
          {getLinkDescription(link)}
        </p>
      </div>
    </div>
  );
}

function MockCtaCard({ compact = false }: { compact?: boolean }) {
  return (
    <section className={cn("rounded-2xl border bg-background p-4 shadow-sm", compact ? "grid gap-3" : "")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Mock CTA
          </p>
          <h3 className={cn("mt-1 font-semibold", compact ? "text-base" : "text-xl")}>
            Book a private consultation
          </h3>
        </div>
        <Badge variant="outline">lab</Badge>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Static planning CTA for future layouts. No save, publish, or submission behavior.
      </p>
      <div className={cn("mt-4 grid gap-2", compact ? "" : "sm:grid-cols-2")}>
        <div className="flex items-center gap-2 rounded-xl bg-foreground px-3 py-2 text-sm font-medium text-background">
          <CalendarDays className="size-4" />
          Reserve time
        </div>
        <div className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium">
          <Mail className="size-4" />
          Ask a question
        </div>
      </div>
    </section>
  );
}

function MockFormEmbed({ compact = false }: { compact?: boolean }) {
  return (
    <section className="rounded-2xl border bg-background p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Mock form / embed
          </p>
          <h3 className={cn("mt-1 font-semibold", compact ? "text-base" : "text-xl")}>
            Quick request block
          </h3>
        </div>
        <Badge variant="secondary">no API</Badge>
      </div>
      <div className="mt-4 grid gap-2">
        <div className="h-9 rounded-xl border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Name field placeholder
        </div>
        <div className="h-9 rounded-xl border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Email field placeholder
        </div>
        <div className="h-16 rounded-xl border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Message or embedded content preview
        </div>
      </div>
    </section>
  );
}

function PhonePreview() {
  return (
    <div className="mx-auto w-full max-w-[390px] rounded-[2.2rem] border border-zinc-800 bg-zinc-950 p-3 shadow-2xl">
      <div className="overflow-hidden rounded-[1.7rem] bg-background">
        <div className="flex items-center justify-between px-5 py-3 text-[11px] font-semibold">
          <span>9:41</span>
          <div className="h-4 w-20 rounded-full bg-zinc-950" />
          <span>5G</span>
        </div>
        <div className="max-h-[760px] overflow-y-auto bg-muted/35 px-4 pb-5">
          <div className="grid gap-4 py-4">
            <PhoneHero />
            <MockCtaCard compact />
            <section className="grid gap-2.5">
              {enabledLinks.slice(0, 4).map((link, index) => (
                <PhoneLinkButton key={link.id} link={link} featured={index === 0} />
              ))}
            </section>
            <MockFormEmbed compact />
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopHeroColumn() {
  const { header, text } = mockBuilderData;

  return (
    <aside className="grid content-start gap-5 rounded-2xl border bg-background p-6 shadow-sm">
      <div className="overflow-hidden rounded-2xl border bg-muted">
        <LabImage src={heroImageUrl} className="h-64 w-full object-cover" />
      </div>
      <div className="grid gap-4">
        <div className="flex items-center gap-4">
          <div className="size-16 overflow-hidden rounded-full border bg-muted">
            <LabImage src={header.avatarUrl} className="size-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              @{header.publicHandle || header.username}
            </p>
            <h3 className="mt-1 text-3xl font-semibold leading-tight">{header.displayName}</h3>
          </div>
        </div>
        <p className="text-base leading-7 text-muted-foreground">{header.tagline}</p>
        <p className="text-sm leading-6 text-muted-foreground">{text.intro}</p>
        <SocialBadges />
      </div>
    </aside>
  );
}

function DesktopFeaturedLink({ link }: { link: BioLink }) {
  const visualUrl = getVisualUrl(link);

  return (
    <article className="grid overflow-hidden rounded-2xl border bg-background shadow-sm sm:grid-cols-[180px_minmax(0,1fr)]">
      <div className="min-h-44 bg-muted">
        {visualUrl ? <LabImage src={visualUrl} className="size-full object-cover" /> : null}
      </div>
      <div className="grid content-center gap-3 p-5">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{getLinkTypeLabel(link)}</Badge>
          {link.settings.prioritize ? <Badge>Top</Badge> : null}
        </div>
        <h3 className="text-2xl font-semibold leading-tight">{getLinkLabel(link)}</h3>
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
          {getLinkDescription(link)}
        </p>
      </div>
    </article>
  );
}

function DesktopContentCard({ link }: { link: BioLink }) {
  const visualUrl = getVisualUrl(link);

  return (
    <article className="grid gap-3 rounded-2xl border bg-background p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Badge variant="outline">{getLinkTypeLabel(link)}</Badge>
          <h4 className="mt-2 text-base font-semibold leading-tight">{getLinkLabel(link)}</h4>
        </div>
        <div className="size-12 overflow-hidden rounded-xl bg-muted">
          {visualUrl ? <LabImage src={visualUrl} className="size-full object-cover" /> : null}
        </div>
      </div>
      <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{getLinkDescription(link)}</p>
      <div className="rounded-xl bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
        Static lab preview only
      </div>
    </article>
  );
}

function PcPreview() {
  const secondaryLinks = enabledLinks.filter((link) => link.id !== featuredLink?.id).slice(0, 4);

  return (
    <div className="overflow-hidden rounded-2xl border bg-muted/30 p-5 shadow-sm">
      <div className="grid min-h-[680px] gap-5 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.35fr)]">
        <DesktopHeroColumn />

        <section className="grid content-start gap-5">
          <div className="rounded-2xl border bg-background p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Desktop landing layout
            </p>
            <h3 className="mt-2 text-2xl font-semibold">Links, CTA, forms, and content cards</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Wider desktop planning surface keeps profile storytelling separate from action
              cards so it does not read like a stretched mobile layout.
            </p>
          </div>

          {featuredLink ? <DesktopFeaturedLink link={featuredLink} /> : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <MockCtaCard />
            <MockFormEmbed />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {secondaryLinks.map((link) => (
              <DesktopContentCard key={link.id} link={link} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function StyleSampleCard({
  sample,
  visualUrl,
}: {
  sample: (typeof styleSamples)[number];
  visualUrl: string;
}) {
  const Icon = sample.icon;

  if (sample.style === "image-full") {
    return (
      <article className="overflow-hidden rounded-2xl border bg-background shadow-sm">
        <div className="relative h-36 bg-muted">
          {visualUrl ? <LabImage src={visualUrl} className="size-full object-cover" /> : null}
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-4 text-white">
            <p className="text-sm font-semibold">{sample.label}</p>
            <p className="mt-1 text-xs text-white/80">{sample.description}</p>
          </div>
        </div>
      </article>
    );
  }

  if (sample.style === "card-left-image") {
    return (
      <article className="grid grid-cols-[84px_minmax(0,1fr)] gap-3 rounded-2xl border bg-background p-3 shadow-sm">
        <div className="overflow-hidden rounded-xl bg-muted">
          {visualUrl ? <LabImage src={visualUrl} className="size-full object-cover" /> : null}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{sample.label}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
            {sample.description}
          </p>
        </div>
      </article>
    );
  }

  if (sample.style === "text-panel") {
    return (
      <article className="rounded-2xl border bg-muted/40 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="size-4" />
          {sample.label}
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{sample.description}</p>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "rounded-2xl border bg-background p-4 shadow-sm",
        sample.style === "icon-left" ? "flex items-center gap-3" : "grid gap-1 text-center"
      )}
    >
      {sample.style === "icon-left" ? (
        <div className="flex size-10 items-center justify-center rounded-xl bg-foreground text-background">
          <Icon className="size-4" />
        </div>
      ) : null}
      <div className="min-w-0">
        <p className="text-sm font-semibold">{sample.label}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{sample.description}</p>
      </div>
    </article>
  );
}

function ButtonStyleShowcase() {
  return (
    <section className="rounded-2xl border bg-background p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Mock button styles
          </p>
          <h3 className="mt-2 text-lg font-semibold">Button style showcase</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Static style samples for planning only. These do not change the builder schema,
            LinksSection, MobilePreview, or public renderer.
          </p>
        </div>
        <Badge variant="secondary">mock only</Badge>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {styleSamples.map((sample) => (
          <StyleSampleCard key={sample.style} sample={sample} visualUrl={getVisualUrl(visualLink)} />
        ))}
      </div>
    </section>
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

      <div className="mt-5 grid gap-5">
        <Preview />
        <ButtonStyleShowcase />
      </div>
    </section>
  );
}
