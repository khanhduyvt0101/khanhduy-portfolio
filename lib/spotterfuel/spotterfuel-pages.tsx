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
              SpotterFuel provides general fitness planning and education
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
      description="SpotterFuel is built for simple private use: no account, no ads, no HealthKit, on-device workout choices, Apple-managed Pro purchases, and basic diagnostics for reliability."
      eyebrow="Privacy Policy"
      title="SpotterFuel privacy policy"
    >
      <div className="grid gap-6">
        <InfoCard icon={ShieldCheck} title="Summary">
          <p>
            SpotterFuel works without creating an account. The app does not use
            ads, third-party tracking, HealthKit, location, camera, contacts, or
            a SpotterFuel account server. Exercise choices and workout
            information stay on your device.
          </p>
          <p>
            Basic app launch and diagnostic information may be processed through
            Expo and Apple platform services to monitor reliability and app
            health. This diagnostic information is not used for advertising or
            third-party tracking.
          </p>
          <p>
            SpotterFuel Pro is an optional one-time in-app purchase handled by
            Apple. SpotterFuel stores whether Pro is active so it can unlock all
            swap options and the Also busy filter.
          </p>
          <p>Last updated: {spotterFuel.updatedAt}.</p>
        </InfoCard>

        <div className="grid gap-6 md:grid-cols-2">
          <InfoCard icon={Dumbbell} title="Data in the app">
            <p>
              Muscle selections, busy equipment choices, exercises, and swap
              suggestions entered or viewed in SpotterFuel stay on your device.
              SpotterFuel does not operate a login or account system for this
              information.
            </p>
          </InfoCard>
          <InfoCard icon={Sparkles} title="SpotterFuel Pro purchases">
            <p>
              SpotterFuel Pro is purchased through Apple&apos;s in-app purchase
              system as a one-time, non-subscription unlock. Apple processes the
              payment, Apple ID purchase history, refunds, taxes, and store
              account details under Apple&apos;s own policies.
            </p>
            <p>
              The app may receive purchase and entitlement status from Apple,
              such as whether the SpotterFuel Pro product is active, so the app
              can unlock paid features and let you check purchase status from
              Purchase Help. SpotterFuel does not receive your credit card
              number or full Apple ID payment details.
            </p>
          </InfoCard>
          <InfoCard icon={BarChart3} title="Diagnostics">
            <p>
              SpotterFuel may use Expo Insights and Apple-provided diagnostics
              to understand app launches, crashes, and reliability. These tools
              help maintain the app and are not used to build advertising
              profiles, sell data, or track you across apps and websites.
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
              does not receive personal App Store account payment details from
              Apple.
            </p>
          </InfoCard>
          <InfoCard icon={Activity} title="Health and fitness data">
            <p>
              SpotterFuel does not read from or write to Apple Health or
              HealthKit. It does not collect medical records, clinical data, or
              health research data, and it does not use fitness information for
              advertising, marketing, or data mining.
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
      description="Terms for using SpotterFuel as a general fitness education app with an optional one-time Pro unlock, not medical advice or a medical device."
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
          <InfoCard icon={Sparkles} title="SpotterFuel Pro">
            <p>
              SpotterFuel may offer an optional one-time in-app purchase called
              SpotterFuel Pro. Pro unlocks all same-muscle swap options and the
              Also busy filter. Free users can still use the app with the single
              best swap suggestion.
            </p>
            <p>
              SpotterFuel Pro is not a subscription. The purchase is handled by
              Apple through the App Store. Purchase availability, taxes,
              refunds, family sharing, payment method issues, and App Store
              account controls are managed by Apple and may be subject to
              Apple&apos;s terms and policies.
            </p>
            <p>
              If you already purchased Pro, use Purchase Help in the app to
              check purchase status and recover access for the Apple ID that
              made the purchase.
            </p>
          </InfoCard>
          <InfoCard icon={Activity} title="General fitness information">
            <p>
              SpotterFuel provides general fitness planning and education only.
              It is not medical advice, not a medical device, and does not
              diagnose, treat, cure, or prevent any disease, injury, or medical
              condition.
            </p>
            <p>
              Talk with a qualified healthcare professional or certified fitness
              professional before beginning a new exercise program, especially
              if you have an injury, medical condition, pain, dizziness,
              shortness of breath, or other concerning symptoms.
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
              chest discomfort, faintness, or other concerning symptoms. Seek
              emergency help when needed. You are responsible for choosing
              appropriate exercises, loads, setup, and technique for your own
              situation.
            </p>
          </InfoCard>
          <InfoCard icon={Apple} title="App Store and platform rules">
            <p>
              SpotterFuel does not provide regulated healthcare services, does
              not conduct health research, does not use HealthKit, and does not
              offer insurance, medical, or performance outcome guarantees. The
              app should be used only for lawful personal fitness planning and
              education.
            </p>
            <p>
              Digital feature unlocks in the iOS app use Apple in-app purchase.
              Do not attempt to bypass App Store purchase controls, misuse
              purchase recovery, or interfere with entitlement checks.
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
