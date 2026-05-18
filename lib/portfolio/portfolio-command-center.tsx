import { IconBrandGithub } from "@tabler/icons-react";
import {
  ArrowUpRight,
  Braces,
  Code2,
  ExternalLink,
  FileJson,
  FileText,
  Layers3,
  type LucideIcon,
  MessageSquareText,
  Workflow,
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
import { AiAgentMarketplace } from "~/lib/ai-agents/ai-agent-marketplace";
import { freeTools } from "~/lib/free-tools/tool-meta";
import { HeroPetPlayground } from "~/lib/portfolio/hero-pet-playground";
import { PortfolioSocialLinks } from "~/lib/portfolio/portfolio-social-links";
import { WorkflowBankCountStat } from "~/lib/portfolio/workflow-bank-count-stat";
import { CatalogPageNavigation } from "~/lib/site/catalog-page-navigation";
import { getCatalogPageCount } from "~/lib/site/catalog-pagination";
import { cn } from "~/lib/utils";

const experienceStartYear = 2021;

type Product = {
  name: string;
  label: string;
  href: string;
  image: string;
  metric: string;
  description: string;
  accent: string;
  icon: LucideIcon;
  stack: string[];
};

const products: Product[] = [
  {
    name: "ChatAcademia",
    label: "AI research platform",
    href: "https://chatacademia.com",
    image: "https://www.chatacademia.com/og.png",
    metric: "2,000+ researchers",
    description:
      "A research workspace for searching papers, talking with frontier models, finding gaps, and moving from idea to citation-backed draft.",
    accent: "from-cyan-300 via-sky-400 to-lime-300",
    icon: MessageSquareText,
    stack: ["Next.js", "AI agents", "Academic search", "Subscriptions"],
  },
  {
    name: "PDF Vector",
    label: "Document intelligence API",
    href: "https://pdfvector.com",
    image: "https://www.pdfvector.com/og.png",
    metric: "structured extraction",
    description:
      "A scalable PDF processing API for extracting structured data from complex documents and powering document automation systems.",
    accent: "from-orange-300 via-rose-300 to-cyan-300",
    icon: FileText,
    stack: ["API design", "PDF parsing", "RAG pipelines", "Schema extraction"],
  },
];

const featuredTools = [
  "palette-from-image",
  "image-compressor",
  "images-to-pdf",
  "json-formatter",
  "qr-code-generator",
  "timestamp-converter",
]
  .map((slug) => freeTools.find((tool) => tool.slug === slug))
  .filter((tool): tool is (typeof freeTools)[number] => Boolean(tool));

const workflowBank = {
  href: "https://github.com/khanhduyvt0101/workflows",
  highlights: [
    "Invoice, receipt, PO, bank statement, and AP approval automation",
    "Healthcare, insurance, KYC, compliance, lease, and shipping document flows",
    "Research, resume, transcript, grant, and knowledge-work extraction recipes",
  ],
};

export function PortfolioCommandCenter(): ReactNode {
  const yearsOfExperience = Math.max(
    0,
    new Date().getFullYear() - experienceStartYear,
  );
  const workflowBankStats = [
    {
      label: "format",
      value: "JSON imports",
      icon: FileJson,
    },
    {
      label: "coverage",
      value: "PDF automation",
      icon: Layers3,
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="relative isolate overflow-hidden border-b border-border/70">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:56px_56px] opacity-25" />
        <div className="absolute inset-x-0 top-0 -z-10 h-36 bg-[linear-gradient(180deg,var(--accent),transparent)] opacity-45" />

        <div className="container mx-auto grid max-w-7xl gap-8 px-4 py-8 md:py-12 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-center">
          <div className="flex min-w-0 flex-col gap-6">
            <div className="max-w-4xl">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Bui Trong Khanh Duy / Full-stack developer / Vietnam
              </p>
              <h1 className="mt-5 text-5xl font-black leading-[0.95] tracking-normal md:text-7xl">
                Software engineer simplifying ideas with technology.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                I'm Khanh Duy, a full-stack developer in Ho Chi Minh City. For{" "}
                {yearsOfExperience}+ years, I've shipped web and mobile products
                that turn complex ideas into fast, simple, reliable experiences
                with JavaScript, React, TypeScript, and Next.js.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <HeroMetric
                icon={Code2}
                label="Experience"
                value={`${yearsOfExperience}+ years`}
              />
              <HeroMetric icon={Braces} label="Stack" value="JS / TS / React" />
              <HeroMetric
                icon={FileText}
                label="Free tools"
                value={`${freeTools.length} tools`}
              />
              <HeroMetric
                icon={MessageSquareText}
                label="AI agents"
                value={`${agentBlueprints.length} agents`}
              />
            </div>

            <PortfolioSocialLinks />
          </div>

          <div className="relative mx-auto w-full max-w-[430px]">
            <div className="rounded-lg border bg-card p-3 shadow-2xl">
              <div className="relative aspect-[5/6] overflow-hidden rounded-md border bg-muted sm:aspect-[4/5] lg:aspect-[5/6]">
                <Image
                  alt="Khanh Duy"
                  src="/avatar.webp"
                  fill
                  preload
                  sizes="(max-width: 1024px) 82vw, 430px"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="absolute inset-x-3 bottom-3 rounded-lg border bg-background/92 p-4 shadow-xl backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Currently
                </p>
                <Badge variant="secondary" className="rounded-lg">
                  Vietnam / GMT+7
                </Badge>
              </div>
              <p className="mt-3 text-xl font-black leading-tight">
                Building useful AI systems that people can actually operate.
              </p>
            </div>
          </div>
        </div>
        <HeroPetRunway />
      </section>

      <section
        id="products"
        className="border-b border-border/70 bg-muted/25 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Products
              </p>
              <h2 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
                Two serious products, one compact story.
              </h2>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {products.map((product) => (
              <Card
                key={product.name}
                className="overflow-hidden rounded-lg py-0"
              >
                <CardHeader className="gap-4 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="rounded-lg">
                      <product.icon />
                      {product.label}
                    </Badge>
                    <Badge variant="secondary" className="rounded-lg">
                      {product.metric}
                    </Badge>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <CardTitle className="text-3xl font-black">
                        {product.name}
                      </CardTitle>
                      <CardDescription className="mt-3 text-base leading-7">
                        {product.description}
                      </CardDescription>
                    </div>
                    <Button asChild variant="ghost" size="icon">
                      <a
                        href={product.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${product.name}`}
                      >
                        <ExternalLink />
                      </a>
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-0">
                  <div className="relative aspect-[16/9] overflow-hidden rounded-lg border bg-white">
                    <Image
                      alt={`${product.name} product preview`}
                      src={product.image}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-contain p-3"
                    />
                    <div className="absolute inset-x-3 bottom-3 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full bg-gradient-to-r",
                          product.accent,
                        )}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {product.stack.map((item) => (
                      <Badge
                        key={item}
                        variant="outline"
                        className="rounded-lg"
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section
        id="workflow-bank"
        className="border-b border-border/70 bg-background py-14 md:py-20"
      >
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.55fr)] lg:items-stretch">
            <div className="relative overflow-hidden rounded-lg border bg-card p-5 shadow-xs md:p-7">
              <div className="absolute inset-y-0 right-0 w-1/2 bg-[linear-gradient(135deg,transparent,var(--muted),transparent)] opacity-60" />
              <div className="relative">
                <div className="mb-8 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-lg">
                    <Workflow />
                    Workflow bank
                  </Badge>
                  <Badge variant="secondary" className="rounded-lg">
                    n8n live / Make and Zapier mapped
                  </Badge>
                </div>

                <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Open source automation library
                </p>
                <h2 className="mt-3 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
                  Ready-to-import document workflows for real operations.
                </h2>
                <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
                  A public bank of PDF Vector powered automations for teams that
                  need documents to become structured actions: invoices,
                  contracts, statements, resumes, medical records, and more.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Button asChild className="rounded-lg" size="lg">
                    <a
                      href={workflowBank.href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <IconBrandGithub />
                      Open repository
                      <ArrowUpRight data-icon="inline-end" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <WorkflowBankCountStat />
                {workflowBankStats.map((stat) => (
                  <div
                    className="rounded-lg border bg-muted/30 p-4"
                    key={stat.label}
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground">
                        {stat.label}
                      </span>
                      <stat.icon className="size-4 text-muted-foreground" />
                    </div>
                    <p className="text-xl font-black leading-tight">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border bg-card p-4">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground">
                  Recipes inside
                </p>
                <div className="mt-4 grid gap-3">
                  {workflowBank.highlights.map((highlight) => (
                    <div
                      className="flex gap-3 rounded-lg border bg-background p-3 text-sm leading-6"
                      key={highlight}
                    >
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AiAgentMarketplace compact />

      <section className="container mx-auto max-w-7xl px-4 py-14 md:py-20">
        <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Free tools
            </p>
            <h2 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
              The useful links, without the maze.
            </h2>
          </div>
          <Button asChild variant="outline" className="w-fit rounded-lg">
            <Link href="/free-tools">
              Show all
              <ArrowUpRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featuredTools.map((tool) => (
            <Card key={tool.slug} className="rounded-lg py-5">
              <CardHeader className="gap-3">
                <CardTitle className="text-xl">{tool.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-base leading-7">
                  {tool.summary}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="secondary" className="rounded-lg">
                  <Link href={`/free-tools/${tool.slug}`}>Open tool</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-7 flex flex-col items-center gap-3">
          <p className="text-center text-muted-foreground text-sm">
            Showing 1-{featuredTools.length} of {freeTools.length} free tools
          </p>
          <CatalogPageNavigation
            basePath="/free-tools"
            currentPage={1}
            label="Free tools pages"
            pageCount={getCatalogPageCount(freeTools)}
          />
        </div>
      </section>
    </div>
  );
}

function HeroPetRunway(): ReactNode {
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <div className="container relative mx-auto h-full max-w-7xl px-4">
        <HeroPetPlayground />
      </div>
    </div>
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
