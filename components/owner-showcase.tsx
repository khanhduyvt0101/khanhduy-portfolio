import { ArrowUpRight } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import cafesignalLogo from "~/assets/products/cafesignal.webp";
import campuscueLogo from "~/assets/products/campuscue.webp";
import lofihoodLogo from "~/assets/products/lofihood.webp";
import movehaloLogo from "~/assets/products/movehalo.webp";
import photodayCleanerLogo from "~/assets/products/photoday-cleaner.webp";
import spotterfuelLogo from "~/assets/products/spotterfuel.webp";
import wakearcLogo from "~/assets/products/wakearc.webp";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { appLinks, discordBot } from "~/lib/profile";

const appLogos: Record<(typeof appLinks)[number]["label"], StaticImageData> = {
  LofiHood: lofihoodLogo,
  SpotterFuel: spotterfuelLogo,
  CampusCue: campuscueLogo,
  WakeArc: wakearcLogo,
  CafeSignal: cafesignalLogo,
  "PhotoDay Cleaner": photodayCleanerLogo,
  MoveHalo: movehaloLogo,
};

const cardSpans = [
  "md:col-span-6 lg:col-span-7",
  "md:col-span-6 lg:col-span-5",
  "md:col-span-6 lg:col-span-4",
  "md:col-span-6 lg:col-span-4",
  "md:col-span-12 lg:col-span-4",
] as const;

type OwnedProduct = (typeof appLinks)[number] | typeof discordBot;

function ProductCard({
  app,
  span,
}: {
  app: OwnedProduct;
  span: string;
}): ReactNode {
  return (
    <Card
      className={`group min-h-80 overflow-hidden transition-[transform,box-shadow,background-color] duration-500 ease-out hover:-translate-y-1 hover:shadow-(--glass-shadow-lg) ${span}`}
    >
      <CardHeader>
        <Badge variant="secondary">{app.platform}</Badge>
        <CardAction>
          <Button asChild size="icon" variant="ghost">
            <a
              aria-label={`Visit ${app.label}`}
              href={app.href}
              data-analytics-cta={`owner_showcase:${app.label}`}
              rel="noreferrer"
              target="_blank"
            >
              <ArrowUpRight />
            </a>
          </Button>
        </CardAction>
        <CardTitle className="text-2xl">{app.label}</CardTitle>
        <CardDescription className="max-w-md text-base leading-6">
          {app.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-end justify-end">
        <div className="glass-control overflow-hidden rounded-2xl p-1.5 transition-transform duration-700 ease-out group-hover:scale-105">
          <Image
            alt={`${app.label} ${app.platform === "Discord" ? "bot" : "app"} logo`}
            className="size-32 object-cover sm:size-40"
            placeholder={app.platform === "Discord" ? "empty" : "blur"}
            src={
              app.platform === "Discord"
                ? "/voxy-brand.webp"
                : appLogos[app.label]
            }
            width={256}
            height={256}
          />
        </div>
      </CardContent>
      <CardFooter className="justify-between text-muted-foreground text-sm">
        <span>{new URL(app.href).hostname}</span>
        <span>Owned product</span>
      </CardFooter>
    </Card>
  );
}

export function OwnerShowcase(): ReactNode {
  const groups = [
    { id: "owner-products", title: "Discord Bot", products: [discordBot] },
    {
      id: "macos-apps",
      title: "macOS Apps",
      products: appLinks.filter((app) => app.platform === "macOS"),
    },
    {
      id: "ios-apps",
      title: "iOS Apps",
      products: appLinks.filter((app) => app.platform !== "macOS"),
    },
  ];
  return (
    <>
      {groups.map((group) => (
        <section
          className="relative py-24 md:py-32"
          id={group.id}
          key={group.id}
        >
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
            <h2 className="max-w-3xl text-balance font-heading text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
              {group.title}
            </h2>
            <div className="grid grid-flow-dense gap-4 md:grid-cols-12">
              {group.products.map((app, index) => (
                <ProductCard
                  app={app}
                  key={app.href}
                  span={
                    group.products.length === 1
                      ? "md:col-span-12"
                      : cardSpans[index]
                  }
                />
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
