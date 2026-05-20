import {
  Activity,
  Apple,
  BarChart3,
  BookOpen,
  Dumbbell,
  HelpCircle,
  type LucideIcon,
  Mail,
  ShieldCheck,
  Sparkles,
  Utensils,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "~/components/ui/button";
import { serializeJsonLd, siteUrl } from "~/lib/site/seo";
import {
  spotterFuel,
  spotterFuelUrls,
} from "~/lib/spotterfuel/spotterfuel-content";
import { cn } from "~/lib/utils";

const appStoreLinks = [
  {
    href: spotterFuel.paths.marketing,
    label: "Overview",
  },
  {
    href: spotterFuel.paths.support,
    label: "Support",
  },
  {
    href: spotterFuel.paths.privacy,
    label: "Privacy",
  },
  {
    href: spotterFuel.paths.terms,
    label: "Terms",
  },
];

const appFeatures = [
  {
    icon: Dumbbell,
    title: "Workout planning",
    description:
      "Build practical training sessions with set, rep, and intensity guidance for common strength movements.",
  },
  {
    icon: BookOpen,
    title: "Exercise library",
    description:
      "Browse movement notes, muscle focus, and coaching cues without creating an account.",
  },
  {
    icon: Utensils,
    title: "Fuel planning",
    description:
      "Plan simple meals, protein targets, hydration, and pre-workout nutrition around your training day.",
  },
  {
    icon: BarChart3,
    title: "Progress insights",
    description:
      "Review training consistency, recovery reminders, and general fitness education in one quiet dashboard.",
  },
];

const privacyFacts = [
  "No account or sign-in required",
  "No HealthKit access",
  "No ads or third-party tracking",
  "No subscriptions or in-app purchases",
  "No app data leaves the device",
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
          <AppStoreNavigation />
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

function AppStoreNavigation() {
  return (
    <nav
      aria-label="SpotterFuel pages"
      className="flex flex-wrap items-center gap-2"
    >
      {appStoreLinks.map((item) => (
        <Button asChild key={item.href} size="sm" variant="outline">
          <Link href={item.href} transitionTypes={["nav-forward"]}>
            {item.label}
          </Link>
        </Button>
      ))}
    </nav>
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
            A simple app experience without account setup or tracking.
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
      "SpotterFuel is a no-login workout tracking, exercise library, nutrition planning, and fitness education app for iPhone and iPad.",
    url: spotterFuelUrls.marketing,
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
      description="A simple iPhone and iPad fitness companion for planning workouts, learning movements, organizing meals, and reviewing training progress without an account."
      eyebrow="iOS app"
      title="SpotterFuel keeps training, fuel, and progress in one calm place."
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
              organize their training day. It avoids social feeds, medical
              claims, payments, and external data sync so users can open the app
              and start planning right away.
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
          <InfoCard icon={Sparkles} title="App Store URLs">
            <ul className="grid gap-2 text-sm">
              <li>
                Marketing URL:{" "}
                <Link
                  className="font-medium text-foreground underline"
                  href={spotterFuel.paths.marketing}
                >
                  {spotterFuelUrls.marketing}
                </Link>
              </li>
              <li>
                Support URL:{" "}
                <Link
                  className="font-medium text-foreground underline"
                  href={spotterFuel.paths.support}
                >
                  {spotterFuelUrls.support}
                </Link>
              </li>
              <li>
                Privacy URL:{" "}
                <Link
                  className="font-medium text-foreground underline"
                  href={spotterFuel.paths.privacy}
                >
                  {spotterFuelUrls.privacy}
                </Link>
              </li>
            </ul>
          </InfoCard>
        </div>
      </div>
    </PageShell>
  );
}

export function SpotterFuelSupportPage(): ReactNode {
  return (
    <PageShell
      description="Get help with SpotterFuel app issues, general feedback, and feature requests."
      eyebrow="Support"
      title="SpotterFuel support"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="grid gap-6">
          <InfoCard icon={Mail} title="Contact">
            <p>
              Email{" "}
              <a
                className="font-medium text-foreground underline"
                href={`mailto:${spotterFuel.email}?subject=SpotterFuel%20Support`}
              >
                {spotterFuel.email}
              </a>{" "}
              for app issues, bug reports, accessibility problems, general
              feedback, and feature requests.
            </p>
            <p>
              Developer: {spotterFuel.developer}. Location:{" "}
              {spotterFuel.location}.
            </p>
          </InfoCard>

          <InfoCard icon={HelpCircle} title="Helpful details to include">
            <ul className="grid gap-2">
              <li>Your device model and iOS version.</li>
              <li>Which tab or screen had the issue.</li>
              <li>Steps to reproduce the problem, if possible.</li>
            </ul>
          </InfoCard>

          <InfoCard icon={Activity} title="Health and fitness scope">
            <p>
              SpotterFuel provides general workout and nutrition planning
              information. It is not a medical device, does not diagnose or
              treat health conditions, and does not replace a doctor, dietitian,
              or certified fitness professional.
            </p>
          </InfoCard>
        </div>
        <FactPanel />
      </div>
    </PageShell>
  );
}

export function SpotterFuelPrivacyPage(): ReactNode {
  return (
    <PageShell
      description="SpotterFuel is built for simple private use: no account, no ads, no HealthKit, and no data collected from the app."
      eyebrow="Privacy Policy"
      title="SpotterFuel privacy policy"
    >
      <div className="grid gap-6">
        <InfoCard icon={ShieldCheck} title="Summary">
          <p>
            SpotterFuel does not collect personal data from the iOS app. The app
            works without creating an account, does not use HealthKit, does not
            include ads, and does not share app data with third parties.
          </p>
          <p>Last updated: {spotterFuel.updatedAt}.</p>
        </InfoCard>

        <div className="grid gap-6 md:grid-cols-2">
          <InfoCard icon={Dumbbell} title="Data in the app">
            <p>
              Workout, nutrition, and progress information entered or viewed in
              SpotterFuel stays on your device. SpotterFuel does not operate a
              server account system.
            </p>
          </InfoCard>
          <InfoCard icon={Mail} title="Support email">
            <p>
              If you contact support by email, your email address and message
              are used only to respond to your request. This support
              correspondence happens outside the app through your email
              provider.
            </p>
          </InfoCard>
          <InfoCard icon={Apple} title="Apple and platform services">
            <p>
              Apple may process App Store, purchase, download, crash, or device
              information according to Apple&apos;s own policies. SpotterFuel
              does not receive personal App Store account details from Apple.
            </p>
          </InfoCard>
          <InfoCard icon={HelpCircle} title="Questions">
            <p>
              Email{" "}
              <a
                className="font-medium text-foreground underline"
                href={`mailto:${spotterFuel.email}?subject=SpotterFuel%20Privacy`}
              >
                {spotterFuel.email}
              </a>{" "}
              for privacy questions or support requests.
            </p>
          </InfoCard>
        </div>
      </div>
    </PageShell>
  );
}

export function SpotterFuelTermsPage(): ReactNode {
  return (
    <PageShell
      description="Simple use terms for the SpotterFuel iOS app."
      eyebrow="Terms"
      title="SpotterFuel terms of use"
    >
      <div className="grid gap-6">
        <InfoCard icon={BookOpen} title="Acceptance">
          <p>
            By using SpotterFuel, you agree to use the app responsibly and only
            for lawful personal fitness planning and education.
          </p>
          <p>Last updated: {spotterFuel.updatedAt}.</p>
        </InfoCard>

        <div className="grid gap-6 md:grid-cols-2">
          <InfoCard icon={Activity} title="General fitness information">
            <p>
              SpotterFuel is not medical advice. Talk with a qualified
              professional before beginning a new training or nutrition program,
              especially if you have an injury, medical condition, or dietary
              restriction.
            </p>
          </InfoCard>
          <InfoCard icon={ShieldCheck} title="No guarantee">
            <p>
              Fitness results vary. The app is provided as a planning and
              educational tool without a guarantee of specific health, strength,
              body composition, or performance outcomes.
            </p>
          </InfoCard>
          <InfoCard icon={Dumbbell} title="Safe use">
            <p>
              Stop exercising if you feel pain, dizziness, shortness of breath,
              or other concerning symptoms. Seek emergency help when needed.
            </p>
          </InfoCard>
          <InfoCard icon={Mail} title="Contact">
            <p>
              Questions about these terms can be sent to{" "}
              <a
                className="font-medium text-foreground underline"
                href={`mailto:${spotterFuel.email}?subject=SpotterFuel%20Terms`}
              >
                {spotterFuel.email}
              </a>
              .
            </p>
          </InfoCard>
        </div>
      </div>
    </PageShell>
  );
}
