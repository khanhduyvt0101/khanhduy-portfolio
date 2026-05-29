import {
  Activity,
  Apple,
  BarChart3,
  BookOpen,
  Dumbbell,
  type LucideIcon,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import { serializeJsonLd, siteUrl } from "~/lib/site/seo";
import { spotterFuel } from "~/lib/spotterfuel/spotterfuel-content";
import { cn } from "~/lib/utils";

const appFeatures = [
  {
    icon: Dumbbell,
    title: "Busy equipment swaps",
    description:
      "Pick the muscle you want to train and the equipment that is taken to find same-muscle alternatives.",
  },
  {
    icon: BookOpen,
    title: "Exercise coverage",
    description:
      "Review the exercise, muscle, and equipment coverage used for same-muscle swap suggestions.",
  },
  {
    icon: Activity,
    title: "General fitness guidance",
    description:
      "Use simple educational suggestions that are not medical advice and do not replace professional coaching.",
  },
  {
    icon: BarChart3,
    title: "Private by design",
    description:
      "No login, no ads, no HealthKit access, and no workout content sent to a SpotterFuel account server.",
  },
  {
    icon: Sparkles,
    title: "Optional SpotterFuel Pro",
    description:
      "A one-time Apple in-app purchase can unlock all swap options and the Also busy filter.",
  },
];

const privacyFacts = [
  "No account or sign-in required",
  "No HealthKit access",
  "No ads or third-party tracking",
  "Optional one-time SpotterFuel Pro in-app purchase",
  "Workout choices stay on device",
  "Pro purchase status is handled through Apple",
  "Basic launch diagnostics may be used for reliability",
];

function PageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-background">
      <section className="border-b bg-muted/30">
        <div className="container mx-auto flex max-w-5xl flex-col gap-8 px-4 py-14 md:py-20">
          <div className="grid gap-5">
            <p className="font-semibold text-muted-foreground text-sm uppercase tracking-[0.22em]">
              {eyebrow}
            </p>
            <h1 className="max-w-4xl text-4xl font-black leading-tight text-foreground md:text-6xl">
              {title}
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      </section>
      <div className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
        {children}
      </div>
    </div>
  );
}

function FactPanel() {
  return (
    <aside className="grid gap-4 rounded-lg border bg-muted/30 p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-lg border bg-background">
          <ShieldCheck aria-hidden="true" className="size-5" />
        </span>
        <div>
          <h2 className="font-bold text-lg">Privacy-first basics</h2>
          <p className="text-muted-foreground text-sm">
            A simple app experience without account setup, ads, or third-party
            tracking.
          </p>
        </div>
      </div>
      <ul className="grid gap-2 text-sm">
        {privacyFacts.map((fact) => (
          <li className="flex gap-2" key={fact}>
            <span aria-hidden="true" className="text-primary">
              -
            </span>
            <span>{fact}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function InfoCard({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("grid gap-4 rounded-lg border p-5", className)}>
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-lg border bg-muted/40">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <h2 className="font-bold text-xl">{title}</h2>
      </div>
      <div className="grid gap-3 text-muted-foreground leading-7">
        {children}
      </div>
    </section>
  );
}

export function SpotterFuelMarketingPage(): ReactNode {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: spotterFuel.name,
    applicationCategory: "HealthApplication",
    operatingSystem: "iOS",
    description:
      "SpotterFuel is a no-login fitness education app that suggests same-muscle exercise swaps when gym equipment is taken.",
    url: `${siteUrl}${spotterFuel.paths.marketing}`,
    author: {
      "@type": "Person",
      name: spotterFuel.developer,
      url: siteUrl,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <PageShell
      description="A simple iPhone and iPad fitness companion for finding same-muscle exercise swaps when the equipment you planned to use is busy."
      eyebrow="iOS app"
      title="SpotterFuel helps you keep training when equipment is taken."
    >
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized from static app marketing data and escapes tag starts.
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="grid gap-8">
          <section className="grid gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-lg border bg-muted/40">
                <Apple aria-hidden="true" className="size-5" />
              </span>
              <div>
                <h2 className="font-bold text-2xl">
                  Made for everyday training
                </h2>
                <p className="text-muted-foreground">
                  Focused features, no account wall, and no hidden services.
                </p>
              </div>
            </div>
            <p className="max-w-3xl text-muted-foreground leading-7">
              SpotterFuel is designed for people who want a lightweight way to
              adapt in a busy gym. It avoids social feeds, medical claims,
              subscriptions, ads, and account-based workout storage so users can
              open the app and find a practical swap right away. An optional
              one-time SpotterFuel Pro purchase unlocks all swap options and the
              Also busy filter.
            </p>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            {appFeatures.map((feature) => (
              <InfoCard
                icon={feature.icon}
                key={feature.title}
                title={feature.title}
              >
                <p>{feature.description}</p>
              </InfoCard>
            ))}
          </section>
        </div>

        <div className="grid content-start gap-4">
          <FactPanel />
          <InfoCard icon={Sparkles} title="Product status">
            <p className="text-sm">
              SpotterFuel remains part of Khanh Duy's current app portfolio,
              with product details kept on this overview page.
            </p>
          </InfoCard>
        </div>
      </div>
    </PageShell>
  );
}
