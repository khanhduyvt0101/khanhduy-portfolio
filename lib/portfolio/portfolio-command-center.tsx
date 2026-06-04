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
import {
  ArrowUpRight,
  CheckCircle2,
  Coffee,
  ExternalLink,
  WifiHigh,
} from "lucide-react";
import Image from "next/image";
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
  itemType: "iPhone" | "AppleWatch" | "Mac" | "iPhone + Apple Watch";
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
  visual: "mac" | "phone-stack" | "wifi-menu";
};

const apps: AppShowcase[] = [
  {
    name: "LofiHood",
    itemType: "Mac",
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
    chips: ["Mac", "menu bar", "offline"],
    accentClassName: "from-[#bbf7d0] via-[#fef9c3] to-[#93c5fd]",
    visual: "mac",
  },
  {
    name: "SpotterFuel",
    itemType: "iPhone",
    href: "https://spotterfuel.com",
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
    itemType: "iPhone",
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
    chips: ["iPhone", "review first", "local-first v1"],
    accentClassName: "from-[#bfdbfe] via-[#c4b5fd] to-[#fbcfe8]",
    visual: "phone-stack",
  },
  {
    name: "WakeArc",
    itemType: "iPhone + Apple Watch",
    href: "https://wakearc.com",
    cta: "View WakeArc",
    description:
      "A calm sleep-cycle alarm planner that works around 90-minute cycles, Sleep Now, Wake At, and Apple Watch sync.",
    icon: "/apps/wakearc/app-icon.png",
    iconAlt: "WakeArc app icon",
    visualAlt:
      "WakeArc iPhone screenshots showing Sleep Now, Wake At, and sleep-cycle options.",
    screenshots: {
      primary: "/apps/wakearc/sleep-now.png",
      secondary: "/apps/wakearc/wake-at.png",
      tertiary: "/apps/wakearc/cycle-list.png",
    },
    chips: ["AppleWatch", "sleep cycles", "90-minute cycles"],
    accentClassName: "from-[#c7d2fe] via-[#bfdbfe] to-[#f0abfc]",
    visual: "phone-stack",
  },
  {
    name: "CafeSignal",
    itemType: "Mac",
    href: "https://cafesignal.com",
    cta: "Visit CafeSignal",
    description:
      "A native macOS menu bar app that finds usable open public Wi-Fi, verifies internet access, and helps with simple captive portals when safe.",
    icon: "/apps/cafesignal/app-icon.png",
    iconAlt: "CafeSignal app icon",
    visualAlt:
      "CafeSignal menu preview showing verified public Wi-Fi and ranked network candidates.",
    screenshots: {
      primary: "/apps/cafesignal/app-icon.png",
    },
    chips: ["Mac", "public Wi-Fi", "menu bar"],
    accentClassName: "from-[#bff4f0] via-[#f8e3b5] to-[#f7cba8]",
    visual: "wifi-menu",
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
        <div className="max-w-3xl min-w-0 md:col-start-1 md:row-start-1">
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
            A Ho Chi Minh City developer behind LofiHood, SpotterFuel,
            CampusCue, WakeArc, and CafeSignal: focused tools for Mac playback,
            crowded gyms, school-notice follow-through, sleep-cycle alarms, and
            public Wi-Fi.
          </p>
        </div>

        <HeroAvatarPortrait />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center md:col-start-1 md:row-start-2">
          <SocialLinks />
        </div>
      </div>
    </section>
  );
}

function SocialLinks(): ReactNode {
  return (
    <nav
      aria-label="Khanh Duy social and contact links"
      className="flex flex-wrap gap-1.5 sm:gap-2"
    >
      {socialLinks.map(({ href, icon: Icon, label }) => {
        const external = !href.startsWith("mailto:");

        return (
          <Button
            asChild
            className="group relative size-11 rounded-lg bg-white/75 p-0 shadow-xs backdrop-blur hover:bg-white dark:bg-white/10 dark:hover:bg-white/15 sm:size-12"
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

function HeroAvatarPortrait(): ReactNode {
  return (
    <figure className="relative isolate mx-auto w-[min(62vw,228px)] sm:w-[260px] md:col-start-2 md:row-span-2 md:row-start-1 md:w-full md:max-w-[380px] md:justify-self-center">
      <div
        aria-hidden="true"
        className="-rotate-3 absolute inset-3 rounded-[26px] border border-black/10 bg-[#d9ded8]/70 shadow-[0_22px_48px_rgba(15,23,42,0.13)] dark:border-white/10 dark:bg-white/8"
      />
      <div className="relative overflow-hidden rounded-[26px] border border-black/10 bg-white/82 p-2 shadow-[0_20px_58px_rgba(15,23,42,0.17)] backdrop-blur-xl dark:border-white/12 dark:bg-white/10 dark:shadow-[0_28px_80px_rgba(0,0,0,0.38)] sm:rounded-[30px] sm:p-2.5">
        <div className="mb-2 flex h-6 items-center justify-between px-2 sm:h-7">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-[#ff605c] sm:size-2" />
            <span className="size-1.5 rounded-full bg-[#ffbd44] sm:size-2" />
            <span className="size-1.5 rounded-full bg-[#00ca4e] sm:size-2" />
          </div>
          <div className="h-1.5 w-14 rounded-full bg-black/8 dark:bg-white/16 sm:w-20" />
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-[#dce6d4] ring-1 ring-black/7 dark:bg-[#242824] dark:ring-white/10 sm:rounded-[22px]">
          <Image
            alt="Portrait of Khanh Duy"
            className="object-cover object-[50%_42%]"
            fill
            preload
            sizes="(max-width: 767px) 220px, (max-width: 1024px) 30vw, 360px"
            src="/avatar.webp"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,transparent,rgba(14,16,18,0.18))]"
          />
        </div>
      </div>
    </figure>
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
      className="relative scroll-mt-28 border-black/10 border-t bg-white px-4 py-14 dark:border-white/10 dark:bg-[#151515] sm:px-6 md:scroll-mt-24 md:py-20 lg:px-8"
      id="apps"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="mb-10 grid gap-5 md:grid-cols-[minmax(0,0.9fr)_minmax(260px,0.45fr)] md:items-end">
          <div>
            <h2 className="text-4xl font-semibold leading-tight text-balance md:text-5xl">
              Five focused products, each built around one specific
              interruption.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#646971] dark:text-[#aaaead]">
              Calm playback, crowded-gym reroutes, parent review flows, and
              sleep-cycle alarms, plus public Wi-Fi handoff: each app starts
              with a real moment where the next action should be simpler.
            </p>
          </div>
          <p className="text-sm leading-6 text-[#646971] dark:text-[#aaaead] md:text-right">
            Real app icons, screenshots, and interface previews from the product
            workspaces.
          </p>
        </div>

        <div className="grid auto-rows-fr gap-5 lg:grid-cols-2 xl:grid-cols-6">
          {apps.map((app, index) => (
            <AppTile app={app} index={index} key={app.name} />
          ))}
        </div>
      </div>
    </section>
  );
}

function AppTile({
  app,
  index,
}: {
  app: AppShowcase;
  index: number;
}): ReactNode {
  const layoutClassName = index < 2 ? "xl:col-span-3" : "xl:col-span-2";

  return (
    <article
      className={cn(
        "group flex h-full min-h-[620px] flex-col overflow-hidden rounded-[20px] border border-black/10 bg-[#fbfbf8] shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition duration-150 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(15,23,42,0.13)] motion-reduce:transform-none dark:border-white/10 dark:bg-[#1e1e1f]",
        layoutClassName,
      )}
    >
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
              {app.itemType}
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
          "relative isolate mx-5 grid h-[360px] shrink-0 place-items-center overflow-hidden rounded-[16px] bg-gradient-to-br p-5",
          app.accentClassName,
        )}
      >
        {app.visual === "mac" ? (
          <MacVisual app={app} />
        ) : app.visual === "wifi-menu" ? (
          <CafeSignalVisual app={app} />
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

function CafeSignalVisual({ app }: { app: AppShowcase }): ReactNode {
  const networks = [
    ["Bluebird Cafe Guest", "Verified route", "3"],
    ["Airport Free Wi-Fi", "Portal check", "2"],
    ["Member Lounge", "Account required", "3"],
  ] as const;

  return (
    <div
      aria-label={app.visualAlt}
      role="img"
      className="w-full min-w-0 max-w-[500px] rounded-[18px] border border-black/10 bg-white/92 p-2 shadow-[0_24px_70px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-[#202224]/95 sm:p-3"
    >
      <div className="min-w-0 rounded-[14px] border border-black/10 bg-[#fbfbf8] dark:border-white/10 dark:bg-[#151515] sm:hidden">
        <div className="flex items-center justify-between gap-2 border-black/10 border-b px-2.5 py-2.5 dark:border-white/10">
          <div className="flex min-w-0 items-center gap-2 text-[#646971] text-sm dark:text-[#aaaead]">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-white/8">
              <Coffee aria-hidden="true" className="size-4 text-[#0b8b96]" />
            </span>
            <span className="truncate">CafeSignal menu</span>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#0b8b96]/25 bg-[#0b8b96]/10 px-2.5 py-1.5 text-[#08636b] text-xs dark:text-[#7ee2e2]">
            <CheckCircle2 aria-hidden="true" className="size-3.5" />
            Verified
          </span>
        </div>

        <div className="grid gap-2 p-2">
          <div className="min-w-0 rounded-[12px] border border-black/10 bg-white p-2.5 dark:border-white/10 dark:bg-white/8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[#646971] text-xs dark:text-[#aaaead]">
                  Status
                </p>
                <h3 className="mt-1 text-lg font-semibold">Connected</h3>
              </div>
              <span className="flex h-8 w-12 items-center justify-end rounded-full bg-[#0b8b96] p-1">
                <span className="size-6 rounded-full bg-white shadow-sm" />
              </span>
            </div>
            <p className="mt-2 text-[#646971] text-xs leading-5 dark:text-[#aaaead]">
              Bluebird Cafe Guest is online.
            </p>
          </div>

          <div className="min-w-0 rounded-[12px] border border-black/10 bg-white p-2.5 dark:border-white/10 dark:bg-white/8">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[#646971] text-xs dark:text-[#aaaead]">
                  Ranked public Wi-Fi
                </p>
                <h3 className="mt-1 truncate text-base font-semibold">
                  Best practical route
                </h3>
              </div>
              <WifiHigh aria-hidden="true" className="size-5 text-[#0b8b96]" />
            </div>
            <div className="mt-2 grid gap-2">
              {networks.slice(0, 1).map(([name, detail, level]) => (
                <div
                  className="grid min-h-10 grid-cols-[1fr_auto] items-center gap-2 rounded-lg border border-black/10 bg-[#fbfbf8] px-3 py-2 dark:border-white/10 dark:bg-[#151515]"
                  key={name}
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{name}</p>
                    <p className="mt-0.5 truncate text-[#646971] text-[11px] dark:text-[#aaaead]">
                      {detail}
                    </p>
                  </div>
                  <div
                    className="flex h-5 items-end gap-0.5"
                    aria-hidden="true"
                  >
                    {[1, 2, 3].map((bar) => (
                      <span
                        className={cn(
                          "block w-1 rounded-full",
                          Number(level) >= bar
                            ? "bg-[#0b8b96]"
                            : "bg-[#8d939b]/30",
                        )}
                        key={bar}
                        style={{ height: `${bar * 5 + 4}px` }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden min-w-0 rounded-[14px] border border-black/10 bg-[#fbfbf8] dark:border-white/10 dark:bg-[#151515] sm:block">
        <div className="flex items-center justify-between gap-3 border-black/10 border-b px-4 py-3 dark:border-white/10">
          <div className="flex min-w-0 items-center gap-2 text-[#646971] text-sm dark:text-[#aaaead]">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-white/8">
              <Coffee aria-hidden="true" className="size-4 text-[#0b8b96]" />
            </span>
            <span className="truncate">CafeSignal menu</span>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#0b8b96]/25 bg-[#0b8b96]/10 px-3 py-1.5 text-[#08636b] text-xs dark:text-[#7ee2e2]">
            <CheckCircle2 aria-hidden="true" className="size-3.5" />
            Verified
          </span>
        </div>

        <div className="grid grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] gap-3 p-4">
          <div className="min-w-0 rounded-[12px] border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/8">
            <p className="text-[#646971] text-xs dark:text-[#aaaead]">Status</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">Connected</h3>
              <span className="flex h-9 w-14 items-center justify-end rounded-full bg-[#0b8b96] p-1">
                <span className="size-7 rounded-full bg-white shadow-sm" />
              </span>
            </div>
            <p className="mt-4 text-[#646971] text-xs leading-5 dark:text-[#aaaead]">
              Bluebird Cafe Guest is online. Last checked 15:44.
            </p>
            <div className="mt-4 grid gap-2">
              {["Check Now", "Portal Assistant", "Settings"].map((item) => (
                <div
                  className="flex min-h-8 items-center justify-between rounded-lg border border-black/10 bg-[#fbfbf8] px-3 text-xs dark:border-white/10 dark:bg-[#151515]"
                  key={item}
                >
                  {item}
                  <span className="size-1.5 rounded-full bg-[#8d939b]" />
                </div>
              ))}
            </div>
          </div>

          <div className="min-w-0 rounded-[12px] border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[#646971] text-xs dark:text-[#aaaead]">
                  Ranked public Wi-Fi
                </p>
                <h3 className="mt-1 text-lg font-semibold">
                  Best practical route
                </h3>
              </div>
              <WifiHigh aria-hidden="true" className="size-5 text-[#0b8b96]" />
            </div>
            <div className="mt-4 grid gap-2">
              {networks.map(([name, detail, level]) => (
                <div
                  className="grid min-h-[52px] grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-black/10 bg-[#fbfbf8] px-3 py-2 dark:border-white/10 dark:bg-[#151515]"
                  key={name}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{name}</p>
                    <p className="mt-0.5 truncate text-[#646971] text-xs dark:text-[#aaaead]">
                      {detail}
                    </p>
                  </div>
                  <div
                    className="flex h-5 items-end gap-0.5"
                    aria-hidden="true"
                  >
                    {[1, 2, 3].map((bar) => (
                      <span
                        className={cn(
                          "block w-1 rounded-full",
                          Number(level) >= bar
                            ? "bg-[#0b8b96]"
                            : "bg-[#8d939b]/30",
                        )}
                        key={bar}
                        style={{ height: `${bar * 5 + 4}px` }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
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
