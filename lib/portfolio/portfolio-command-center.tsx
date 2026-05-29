import { IconBrandGithub } from "@tabler/icons-react";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Code2,
  Dumbbell,
  ExternalLink,
  FileJson,
  FileText,
  Headphones,
  ImageIcon,
  Laptop,
  type LucideIcon,
  Mail,
  MapPin,
  Palette,
  School,
  ShieldCheck,
  Sparkles,
  Type,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { agentBlueprints } from "~/lib/ai-agents/agent-catalog";
import { getAgentIcon } from "~/lib/ai-agents/agent-presentation";
import { freeTools, type ToolCategory } from "~/lib/free-tools/tool-meta";
import { cn } from "~/lib/utils";

const experienceStartYear = 2021;

type CurrentApp = {
  name: string;
  domain: string;
  label: string;
  href: string;
  image: string;
  imageAlt: string;
  headline: string;
  description: string;
  cta: string;
  icon: LucideIcon;
  accent: {
    border: string;
    text: string;
    bg: string;
    soft: string;
  };
  chips: string[];
  checks: string[];
};

const currentApps: CurrentApp[] = [
  {
    name: "LofiHood",
    domain: "lofihood.com",
    label: "macOS menu bar app",
    href: "https://lofihood.com",
    image: "https://lofihood.com/opengraph-image.png",
    imageAlt: "LofiHood product preview",
    headline: "Offline lofi that stays out of your way.",
    description:
      "A local-first lofi player for the Mac menu bar with bundled tracks, mood filters, local albums, imports, shortcuts, and a sleep timer.",
    cta: "Visit LofiHood",
    icon: Headphones,
    accent: {
      border: "border-sky-400",
      text: "text-sky-600 dark:text-sky-300",
      bg: "bg-sky-500",
      soft: "bg-sky-500/10",
    },
    chips: ["macOS", "local-first", "mood presets", "coming soon"],
    checks: [
      "Bundled offline tracks",
      "Mood and album filters",
      "Menu-bar playback controls",
    ],
  },
  {
    name: "SpotterFuel",
    domain: "spotterfuel.com",
    label: "iPhone fitness app",
    href: "https://spotterfuel.com",
    image: "https://spotterfuel.com/opengraph-image",
    imageAlt: "SpotterFuel product preview",
    headline: "Keep training when the equipment is taken.",
    description:
      "Mark blocked gym equipment and find same-muscle alternatives so a crowded station does not derail the session.",
    cta: "View SpotterFuel",
    icon: Dumbbell,
    accent: {
      border: "border-emerald-400",
      text: "text-emerald-600 dark:text-emerald-300",
      bg: "bg-emerald-500",
      soft: "bg-emerald-500/10",
    },
    chips: ["iPhone", "same-muscle swaps", "equipment-aware", "App Store"],
    checks: ["119 exercises", "17 muscle groups", "16 equipment types"],
  },
  {
    name: "CampusCue",
    domain: "campuscue.app",
    label: "iOS app for parents",
    href: "https://campuscue.app",
    image: "https://campuscue.app/opengraph-image",
    imageAlt: "CampusCue product preview",
    headline: "School notices become reviewed action cards.",
    description:
      "CampusCue turns flyers, PDFs, screenshots, and shared files into cards parents can review before adding anything to Calendar or Reminders.",
    cta: "View CampusCue",
    icon: School,
    accent: {
      border: "border-orange-400",
      text: "text-orange-600 dark:text-orange-300",
      bg: "bg-orange-500",
      soft: "bg-orange-500/10",
    },
    chips: ["local-first", "review first", "iOS", "TestFlight waitlist"],
    checks: [
      "Flyers, PDFs, screenshots",
      "Parent review before handoff",
      "Calendar and Reminders flow",
    ],
  },
];

const featuredToolSlugs = [
  "json-formatter",
  "qr-code-generator",
  "image-compressor",
  "images-to-pdf",
  "palette-from-image",
  "timestamp-converter",
];

const featuredTools = featuredToolSlugs
  .map((slug) => freeTools.find((tool) => tool.slug === slug))
  .filter((tool): tool is (typeof freeTools)[number] => Boolean(tool));

const toolCategoryIcons: Record<ToolCategory, LucideIcon> = {
  Design: Palette,
  Developer: FileJson,
  Image: ImageIcon,
  PDF: FileText,
  Text: Type,
};

const featuredAgents = agentBlueprints.slice(0, 4);

const stackItems = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Node.js",
  "Vercel",
];

const workPrinciples = [
  {
    icon: ShieldCheck,
    title: "Practical first",
    description:
      "Start with a real interruption, then ship the smallest useful loop.",
  },
  {
    icon: Code2,
    title: "Build clearly",
    description:
      "Readable interfaces, typed code, and fast iteration over ceremony.",
  },
  {
    icon: Sparkles,
    title: "Keep it usable",
    description: "Polish the details that make an app easier to return to.",
  },
];

export function PortfolioCommandCenter(): ReactNode {
  const yearsOfExperience = Math.max(
    0,
    new Date().getFullYear() - experienceStartYear,
  );

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="relative isolate overflow-hidden border-b border-border/70">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20" />
        <div className="absolute inset-x-0 top-0 -z-10 h-56 bg-[linear-gradient(180deg,var(--accent),transparent)] opacity-45" />
        <div className="container relative z-20 mx-auto grid max-w-7xl gap-8 px-4 py-9 md:py-12 lg:min-h-[calc(92svh-64px)] lg:grid-cols-[minmax(0,1fr)_minmax(350px,430px)] lg:items-center">
          <div className="flex min-w-0 flex-col gap-7">
            <div className="max-w-4xl">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Bui Trong Khanh Duy / Product builder / Ho Chi Minh City
              </p>
              <h1 className="mt-5 max-w-5xl text-5xl font-black leading-[0.96] tracking-normal md:text-7xl">
                Building practical apps for focus, fitness, and family
                logistics.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                I'm Khanh Duy, a full-stack developer in Ho Chi Minh City. My
                current work centers on three focused apps: LofiHood for calm
                Mac playback, SpotterFuel for crowded-gym workouts, and
                CampusCue for school notice follow-through.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 rounded-lg px-5" size="lg">
                <Link href="#apps">
                  Explore the apps
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button
                asChild
                className="h-12 rounded-lg px-5"
                size="lg"
                variant="outline"
              >
                <Link href="#workbench">
                  Open tools and agents
                  <Wrench data-icon="inline-end" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              <HeroMetric
                icon={Code2}
                label="Experience"
                value={`${yearsOfExperience}+ years`}
              />
              <HeroMetric icon={Laptop} label="Current apps" value="3 apps" />
              <HeroMetric
                icon={Wrench}
                label="Free tools"
                value={`${freeTools.length} tools`}
              />
              <HeroMetric
                icon={Bot}
                label="AI agents"
                value={`${agentBlueprints.length} agents`}
              />
              <HeroMetric
                icon={Sparkles}
                label="Stack"
                value="JS / TS / React"
              />
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[430px]">
            <div className="rounded-lg border bg-card p-3 shadow-2xl">
              <div className="relative aspect-[5/6] overflow-hidden rounded-md border bg-muted sm:aspect-[4/5] lg:aspect-[5/6]">
                <Image
                  alt="Khanh Duy"
                  className="object-cover"
                  fill
                  preload
                  sizes="(max-width: 1024px) 82vw, 430px"
                  src="/avatar.webp"
                />
              </div>
            </div>

            <div className="absolute inset-x-3 bottom-3 rounded-lg border bg-background/92 p-4 shadow-xl backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Currently
                </p>
                <Badge variant="secondary" className="rounded-lg">
                  <MapPin />
                  Vietnam / GMT+7
                </Badge>
              </div>
              <p className="mt-3 text-xl font-black leading-tight">
                Shipping small products that solve a specific job well.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="apps"
        className="scroll-mt-16 border-b border-border/70 py-14 md:scroll-mt-20 md:py-20"
      >
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Current apps
              </p>
              <h2 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
                Three focused products, built around specific moments of
                friction.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Each app starts with a clear everyday interruption and turns it
                into a simple next action.
              </p>
            </div>
            <p className="font-mono text-sm font-semibold text-muted-foreground">
              03
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {currentApps.map((app) => (
              <CurrentAppCard app={app} key={app.name} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="workbench"
        className="scroll-mt-16 border-b border-border/70 bg-muted/20 py-14 md:scroll-mt-20 md:py-20"
      >
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Browser workbench
              </p>
              <h2 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
                Tools and agents for the work around the apps.
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
                Use small browser agents for summaries, extraction, planning,
                data cleanup, and prompt work. Use private browser tools for
                JSON, QR codes, images, PDFs, text, colors, timestamps, and
                everyday utility tasks.
              </p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <WorkbenchGroup
              cta="Browse agents"
              description="Representative browser-first agents from the full catalog."
              href="/ai-agents"
              items={featuredAgents.map((agent) => ({
                href: `/ai-agents/${agent.id}`,
                icon: getAgentIcon(agent),
                title: agent.name.replace(" Agent", ""),
                description: agent.tagline,
              }))}
              title="AI agents"
            />
            <WorkbenchGroup
              cta="Browse tools"
              description="Private, no-signup browser utilities for everyday tasks."
              href="/free-tools"
              items={featuredTools.map((tool) => ({
                href: `/free-tools/${tool.slug}`,
                icon: toolCategoryIcons[tool.category],
                title: tool.title,
                description: tool.summary,
              }))}
              title="Free tools"
            />
          </div>
        </div>
      </section>

      <section
        id="about"
        className="scroll-mt-16 py-14 md:scroll-mt-20 md:py-20"
      >
        <div className="container mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              About
            </p>
            <h2 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
              Built by Khanh Duy in Ho Chi Minh City.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              I design and ship web, iOS, and macOS products with a focus on
              practical workflows, clear interfaces, and fast iteration across
              React, TypeScript, Next.js, and app-platform tooling.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="rounded-lg" variant="outline">
                <a href="mailto:khanhduyvt0101@gmail.com">
                  <Mail data-icon="inline-start" />
                  Email
                </a>
              </Button>
              <Button asChild className="rounded-lg" variant="outline">
                <a
                  href="https://github.com/khanhduyvt0101"
                  rel="noreferrer"
                  target="_blank"
                >
                  <IconBrandGithub data-icon="inline-start" />
                  GitHub
                </a>
              </Button>
              <Button asChild className="rounded-lg" variant="outline">
                <a
                  href="https://www.linkedin.com/in/buitrongkhanhduy/"
                  rel="noreferrer"
                  target="_blank"
                >
                  LinkedIn
                  <ArrowUpRight data-icon="inline-end" />
                </a>
              </Button>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="overflow-hidden rounded-lg border bg-foreground text-background">
              <div className="border-background/15 border-b px-5 py-4 font-mono text-xs uppercase tracking-[0.2em] text-background/60">
                stack.ts
              </div>
              <div className="grid gap-2 p-5 font-mono text-sm leading-7 sm:p-7">
                <p>
                  <span className="text-background/45">const</span>{" "}
                  <span className="text-sky-300">stack</span> = [
                </p>
                <p className="pl-4 text-background/80">
                  {stackItems.map((item) => `'${item}'`).join(", ")}
                </p>
                <p>];</p>
                <p className="pt-2 text-background/55">
                  {"// Ship small. Iterate fast. Focus on usefulness."}
                </p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {workPrinciples.map((principle) => (
                <div className="rounded-lg border p-5" key={principle.title}>
                  <principle.icon className="mb-5 size-6 text-primary" />
                  <h3 className="font-bold text-lg">{principle.title}</h3>
                  <p className="mt-2 text-muted-foreground text-sm leading-6">
                    {principle.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CurrentAppCard({ app }: { app: CurrentApp }): ReactNode {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-lg py-0 transition-colors hover:border-foreground/20",
        app.accent.border,
      )}
    >
      <CardHeader className="gap-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge className="rounded-lg" variant="outline">
                <app.icon />
                {app.label}
              </Badge>
              <Badge className="rounded-lg" variant="secondary">
                {app.domain}
              </Badge>
            </div>
            <CardTitle className="text-3xl font-black leading-tight">
              {app.name}
            </CardTitle>
            <CardDescription className="mt-3 text-base leading-7">
              {app.headline}
            </CardDescription>
          </div>
          <Button asChild variant="ghost" size="icon">
            <a
              aria-label={`Open ${app.name}`}
              href={app.href}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink />
            </a>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="grid gap-5 p-5 pt-0">
        <div className="relative aspect-[16/10] overflow-hidden rounded-lg border bg-white">
          <Image
            alt={app.imageAlt}
            className="object-contain p-3"
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            src={app.image}
          />
          <div className="absolute inset-x-3 bottom-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className={cn("h-full rounded-full", app.accent.bg)} />
          </div>
        </div>

        <p className="text-muted-foreground text-sm leading-6">
          {app.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {app.chips.map((chip) => (
            <Badge key={chip} variant="outline" className="rounded-lg">
              {chip}
            </Badge>
          ))}
        </div>

        <ul className="grid gap-2 text-sm">
          {app.checks.map((check) => (
            <li className="flex gap-2" key={check}>
              <CheckCircle2
                aria-hidden="true"
                className={cn("mt-0.5 size-4 shrink-0", app.accent.text)}
              />
              <span>{check}</span>
            </li>
          ))}
        </ul>

        <Button asChild className="w-fit rounded-lg" variant="outline">
          <a href={app.href} rel="noreferrer" target="_blank">
            {app.cta}
            <ArrowUpRight data-icon="inline-end" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

function WorkbenchGroup({
  title,
  description,
  items,
  href,
  cta,
}: {
  title: string;
  description: string;
  items: {
    href: string;
    icon: LucideIcon;
    title: string;
    description: string;
  }[];
  href: string;
  cta: string;
}): ReactNode {
  return (
    <section className="rounded-lg border bg-background p-5">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h3 className="text-2xl font-black">{title}</h3>
          <p className="mt-2 max-w-xl text-muted-foreground text-sm leading-6">
            {description}
          </p>
        </div>
        <Button asChild className="w-fit rounded-lg" variant="outline">
          <Link href={href}>
            {cta}
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <Link
            className="group grid min-h-32 gap-3 rounded-lg border p-4 outline-none transition-colors hover:border-foreground/20 hover:bg-muted/45 focus-visible:ring-2 focus-visible:ring-ring/70"
            href={item.href}
            key={item.href}
          >
            <span className="flex items-start justify-between gap-3">
              <span className="grid size-10 place-items-center rounded-lg border bg-muted/35">
                <item.icon className="size-5 text-muted-foreground" />
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </span>
            <span>
              <span className="block font-bold leading-tight">
                {item.title}
              </span>
              <span className="mt-2 line-clamp-2 block text-muted-foreground text-sm leading-6">
                {item.description}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function HeroMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
}): ReactNode {
  return (
    <div className="rounded-lg border border-border/70 bg-background/80 p-3 backdrop-blur">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </span>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
