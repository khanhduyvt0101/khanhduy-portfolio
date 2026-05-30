import {
  type Icon,
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandThreads,
  IconBrandX,
  IconMail,
} from "@tabler/icons-react";
import { ArrowRight, ArrowUpRight, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

type SocialLink = {
  label: string;
  href: string;
  icon: Icon;
};

const socialLinks: SocialLink[] = [
  {
    label: "Email",
    href: "mailto:khanhduyvt0101@gmail.com",
    icon: IconMail,
  },
  {
    label: "GitHub",
    href: "https://github.com/khanhduyvt0101",
    icon: IconBrandGithub,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/buitrongkhanhduy/",
    icon: IconBrandLinkedin,
  },
  {
    label: "X",
    href: "https://x.com/khanhduyvt",
    icon: IconBrandX,
  },
  {
    label: "Threads",
    href: "https://www.threads.net/@_khanhduy",
    icon: IconBrandThreads,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/_khanhduy/",
    icon: IconBrandInstagram,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/khanhduyvt0101",
    icon: IconBrandFacebook,
  },
];

type AppShowcase = {
  name: string;
  platform: string;
  href: string;
  cta: string;
  description: string;
  icon: string;
  iconAlt: string;
  visualAlt: string;
  screenshots: {
    primary: string;
    secondary?: string;
    tertiary?: string;
  };
  chips: string[];
  accentClassName: string;
  visual: "mac" | "phone-stack";
};

const apps: AppShowcase[] = [
  {
    name: "LofiHood",
    platform: "macOS",
    href: "https://lofihood.com",
    cta: "Visit LofiHood",
    description:
      "Offline lofi for your Mac menu bar, with mood presets, local albums, imports, shortcuts, and a sleep timer.",
    icon: "/apps/lofihood/app-icon.png",
    iconAlt: "LofiHood app icon",
    visualAlt:
      "LofiHood album manager and player screenshots from the macOS app website.",
    screenshots: {
      primary: "/apps/lofihood/album-manager.png",
      secondary: "/apps/lofihood/player-panel.png",
      tertiary: "/apps/lofihood/url-import.png",
    },
    chips: ["macOS", "menu bar", "offline"],
    accentClassName: "from-[#bbf7d0] via-[#fef9c3] to-[#93c5fd]",
    visual: "mac",
  },
  {
    name: "SpotterFuel",
    platform: "iPhone",
    href: "https://apps.apple.com/us/app/spotterfuel/id6771243236",
    cta: "Get SpotterFuel",
    description:
      "An iPhone gym companion that finds same-muscle swaps when planned equipment is busy.",
    icon: "/apps/spotterfuel/app-icon.png",
    iconAlt: "SpotterFuel app icon",
    visualAlt:
      "SpotterFuel iPhone screenshots showing same-muscle exercise swaps.",
    screenshots: {
      primary: "/apps/spotterfuel/swap.jpg",
      secondary: "/apps/spotterfuel/library.jpg",
      tertiary: "/apps/spotterfuel/settings.jpg",
    },
    chips: ["iPhone", "same-muscle swaps", "App Store"],
    accentClassName: "from-[#a7f3d0] via-[#99f6e4] to-[#fda4af]",
    visual: "phone-stack",
  },
  {
    name: "CampusCue",
    platform: "iOS",
    href: "https://campuscue.app",
    cta: "View CampusCue",
    description:
      "School flyers, PDFs, and screenshots become reviewable parent action cards before Calendar or Reminders.",
    icon: "/apps/campuscue/app-icon.png",
    iconAlt: "CampusCue app icon",
    visualAlt:
      "CampusCue iPhone screenshots showing school notices and reviewed action cards.",
    screenshots: {
      primary: "/apps/campuscue/screenshot1.png",
      secondary: "/apps/campuscue/screenshot2.png",
      tertiary: "/apps/campuscue/screenshot3.png",
    },
    chips: ["iOS", "review first", "local-first v1"],
    accentClassName: "from-[#bfdbfe] via-[#c4b5fd] to-[#fbcfe8]",
    visual: "phone-stack",
  },
];

export function PortfolioCommandCenter(): ReactNode {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f7f4] text-[#141414] dark:bg-[#111111] dark:text-[#f4f4f0]">
      <HeroSection />
      <AppsSection />
    </div>
  );
}

function HeroSection(): ReactNode {
  return (
    <section className="relative isolate overflow-hidden" id="hero">
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(120deg,rgba(255,255,255,0.92),rgba(235,240,246,0.78)_42%,rgba(244,244,239,0.9))] dark:bg-[linear-gradient(120deg,rgba(20,20,20,0.98),rgba(30,32,35,0.9)_46%,rgba(15,15,15,0.96))]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_16%_18%,rgba(125,211,252,0.2),transparent_34%),radial-gradient(circle_at_76%_10%,rgba(251,207,232,0.2),transparent_30%)] dark:opacity-60" />
      <div className="container mx-auto grid max-w-7xl gap-8 px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-14 md:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] md:items-center lg:min-h-[min(calc(78svh-64px),760px)] lg:px-8">
        <div className="flex min-w-0 flex-col gap-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-[#5b5f66] dark:text-[#b8babf]">
              Bui Trong Khanh Duy / Ho Chi Minh City
            </p>
            <h1 className="mt-5 text-5xl font-semibold leading-none text-balance sm:text-6xl lg:text-7xl">
              Khanh Duy
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-[#32353a] text-balance dark:text-[#d9d9d6] sm:text-2xl sm:leading-9">
              Builds small apps for everyday friction.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#646971] dark:text-[#aaaead]">
              A Ho Chi Minh City developer behind LofiHood, SpotterFuel, and
              CampusCue: focused tools for Mac playback, crowded gyms, and
              school-notice follow-through.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button asChild className="h-12 rounded-lg px-5" size="lg">
              <Link href="#apps">
                View the apps
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <SocialLinks />
          </div>
        </div>

        <HeroProductCluster />
      </div>
    </section>
  );
}

function SocialLinks(): ReactNode {
  return (
    <nav
      aria-label="Khanh Duy social and contact links"
      className="flex flex-wrap gap-2"
    >
      {socialLinks.map(({ href, icon: Icon, label }) => {
        const external = !href.startsWith("mailto:");

        return (
          <Button
            asChild
            className="group relative size-12 rounded-lg bg-white/75 p-0 shadow-xs backdrop-blur hover:bg-white dark:bg-white/10 dark:hover:bg-white/15"
            key={href}
            size="icon"
            variant="outline"
          >
            <a
              aria-label={label}
              href={href}
              rel={external ? "noreferrer" : undefined}
              target={external ? "_blank" : undefined}
            >
              <Icon aria-hidden="true" stroke={1.8} />
              <span
                aria-hidden="true"
                className="-translate-x-1/2 pointer-events-none absolute bottom-[calc(100%+0.5rem)] left-1/2 rounded-md border bg-popover px-2 py-1 text-popover-foreground text-xs opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                {label}
              </span>
            </a>
          </Button>
        );
      })}
    </nav>
  );
}

function HeroProductCluster(): ReactNode {
  return (
    <div
      aria-label="Product previews for LofiHood, SpotterFuel, and CampusCue"
      role="img"
      className="relative mx-auto hidden min-h-[460px] w-full max-w-[680px] md:block lg:min-h-[540px]"
    >
      <div className="absolute inset-x-2 top-2 rounded-[22px] border border-black/10 bg-white/78 p-2 shadow-[0_28px_90px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-white/12 dark:bg-white/8">
        <div className="flex h-10 items-center gap-2 border-black/8 border-b px-4 dark:border-white/10">
          <span className="size-3 rounded-full bg-[#ff605c]" />
          <span className="size-3 rounded-full bg-[#ffbd44]" />
          <span className="size-3 rounded-full bg-[#00ca4e]" />
          <span className="ml-3 text-[#6d7178] text-xs dark:text-[#b8babf]">
            current-apps.local
          </span>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-[14px] bg-[#111318]">
          <Image
            alt="LofiHood album manager window"
            className="object-cover object-left-top"
            fill
            priority
            sizes="(max-width: 1024px) 90vw, 680px"
            src="/apps/lofihood/album-manager.png"
          />
        </div>
      </div>

      <div className="absolute left-0 top-[245px] w-[43%] min-w-[180px] rotate-[-5deg] rounded-[18px] border border-black/10 bg-white p-2 shadow-[0_26px_70px_rgba(15,23,42,0.18)] dark:border-white/12 dark:bg-[#1b1b1d] lg:top-[285px]">
        <Image
          alt="LofiHood player panel"
          className="h-auto w-full rounded-[12px]"
          height={1192}
          priority
          sizes="(max-width: 640px) 190px, 300px"
          src="/apps/lofihood/player-panel.png"
          width={640}
        />
      </div>

      <PhonePreview
        alt="SpotterFuel swap screen"
        className="absolute right-[20%] top-[265px] w-[32%] min-w-[128px] rotate-[5deg] lg:top-[310px]"
        priority
        src="/apps/spotterfuel/swap.jpg"
      />
      <PhonePreview
        alt="CampusCue action inbox"
        className="absolute right-0 top-[205px] w-[34%] min-w-[136px] rotate-[10deg] lg:top-[250px]"
        priority
        src="/apps/campuscue/screenshot1.png"
      />

      <div className="absolute bottom-2 right-4 hidden rounded-2xl border border-black/10 bg-white/82 p-3 shadow-[0_18px_50px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-white/12 dark:bg-white/10 sm:flex sm:items-center sm:gap-3">
        {apps.map((app) => (
          <Image
            alt={app.iconAlt}
            className="rounded-xl"
            height={44}
            key={app.name}
            src={app.icon}
            width={44}
          />
        ))}
      </div>
    </div>
  );
}

function PhonePreview({
  src,
  alt,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}): ReactNode {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[24px] border-[6px] border-[#191a1d] bg-[#191a1d] shadow-[0_24px_70px_rgba(15,23,42,0.24)]",
        className,
      )}
    >
      <Image
        alt={alt}
        className="h-auto w-full rounded-[18px]"
        height={2622}
        priority={priority}
        sizes="(max-width: 640px) 150px, 240px"
        src={src}
        width={1206}
      />
    </div>
  );
}

function AppsSection(): ReactNode {
  return (
    <section
      className="relative scroll-mt-16 border-black/10 border-t bg-white px-4 py-14 dark:border-white/10 dark:bg-[#151515] sm:px-6 md:py-20 lg:px-8"
      id="apps"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="mb-10 grid gap-5 md:grid-cols-[minmax(0,0.9fr)_minmax(260px,0.45fr)] md:items-end">
          <div>
            <h2 className="text-4xl font-semibold leading-tight text-balance md:text-5xl">
              Three focused products, each built around one specific
              interruption.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#646971] dark:text-[#aaaead]">
              Calm playback, crowded-gym reroutes, and parent review flows: each
              app starts with a real moment where the next action should be
              simpler.
            </p>
          </div>
          <p className="text-sm leading-6 text-[#646971] dark:text-[#aaaead] md:text-right">
            Real app icons and screenshots from the product workspaces.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {apps.map((app) => (
            <AppTile app={app} key={app.name} />
          ))}
        </div>
      </div>
    </section>
  );
}

function AppTile({ app }: { app: AppShowcase }): ReactNode {
  return (
    <article className="group flex min-h-[620px] flex-col overflow-hidden rounded-[20px] border border-black/10 bg-[#fbfbf8] shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition duration-150 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(15,23,42,0.13)] motion-reduce:transform-none dark:border-white/10 dark:bg-[#1e1e1f]">
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="flex min-w-0 items-center gap-3">
          <Image
            alt={app.iconAlt}
            className="rounded-[12px] shadow-sm"
            height={48}
            src={app.icon}
            width={48}
          />
          <div className="min-w-0">
            <h3 className="truncate text-2xl font-semibold">{app.name}</h3>
            <p className="text-[#646971] text-sm dark:text-[#aaaead]">
              {app.platform}
            </p>
          </div>
        </div>
        <Button
          asChild
          className="shrink-0 rounded-lg bg-white/80 dark:bg-white/10"
          size="icon"
          variant="outline"
        >
          <a
            aria-label={`Open ${app.name}`}
            href={app.href}
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLink aria-hidden="true" />
          </a>
        </Button>
      </div>

      <div
        className={cn(
          "mx-5 grid min-h-[300px] flex-1 place-items-center overflow-hidden rounded-[16px] bg-gradient-to-br p-5",
          app.accentClassName,
        )}
      >
        {app.visual === "mac" ? (
          <MacVisual app={app} />
        ) : (
          <PhoneStackVisual app={app} />
        )}
      </div>

      <div className="grid gap-4 p-5">
        <p className="min-h-[72px] text-[#32353a] text-sm leading-6 dark:text-[#d9d9d6]">
          {app.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {app.chips.map((chip) => (
            <Badge
              className="rounded-lg border-black/10 bg-white/70 text-[#32353a] dark:border-white/10 dark:bg-white/8 dark:text-[#d9d9d6]"
              key={chip}
              variant="outline"
            >
              {chip}
            </Badge>
          ))}
        </div>
        <Button asChild className="w-fit rounded-lg" variant="outline">
          <a href={app.href} rel="noreferrer" target="_blank">
            {app.cta}
            <ArrowUpRight data-icon="inline-end" />
          </a>
        </Button>
      </div>
    </article>
  );
}

function MacVisual({ app }: { app: AppShowcase }): ReactNode {
  return (
    <div
      className="relative w-full max-w-[520px]"
      aria-label={app.visualAlt}
      role="img"
    >
      <div className="overflow-hidden rounded-[14px] border border-black/12 bg-[#15171b] p-1 shadow-[0_18px_45px_rgba(15,23,42,0.28)]">
        <div className="flex h-7 items-center gap-1.5 px-3">
          <span className="size-2.5 rounded-full bg-[#ff605c]" />
          <span className="size-2.5 rounded-full bg-[#ffbd44]" />
          <span className="size-2.5 rounded-full bg-[#00ca4e]" />
        </div>
        <Image
          alt="LofiHood album manager screen"
          className="h-auto w-full rounded-[10px]"
          height={1296}
          sizes="(max-width: 1024px) 80vw, 360px"
          src={app.screenshots.primary}
          width={2374}
        />
      </div>
      {app.screenshots.secondary ? (
        <div className="-bottom-16 absolute right-2 w-[32%] min-w-[96px] rotate-[4deg] overflow-hidden rounded-[12px] border border-black/10 bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.25)]">
          <Image
            alt="LofiHood player panel"
            className="h-auto w-full rounded-[8px]"
            height={1192}
            sizes="120px"
            src={app.screenshots.secondary}
            width={640}
          />
        </div>
      ) : null}
    </div>
  );
}

function PhoneStackVisual({ app }: { app: AppShowcase }): ReactNode {
  const secondary = app.screenshots.secondary ?? app.screenshots.primary;
  const tertiary = app.screenshots.tertiary ?? app.screenshots.primary;

  return (
    <div
      aria-label={app.visualAlt}
      role="img"
      className="relative h-[310px] w-full max-w-[360px]"
    >
      <PhonePreview
        alt={`${app.name} secondary screen`}
        className="absolute left-0 top-9 w-[46%] rotate-[-9deg] opacity-90"
        src={secondary}
      />
      <PhonePreview
        alt={`${app.name} tertiary screen`}
        className="absolute right-0 top-9 w-[46%] rotate-[9deg] opacity-90"
        src={tertiary}
      />
      <PhonePreview
        alt={`${app.name} primary screen`}
        className="absolute left-1/2 top-0 z-10 w-[52%] -translate-x-1/2"
        src={app.screenshots.primary}
      />
    </div>
  );
}
