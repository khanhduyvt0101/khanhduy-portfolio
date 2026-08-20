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
import { appLinks } from "~/lib/profile";

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
  "md:col-span-7",
  "md:col-span-5",
  "md:col-span-4",
  "md:col-span-4",
  "md:col-span-4",
  "md:col-span-5",
  "md:col-span-7",
] as const;

export function OwnerShowcase(): ReactNode {
  return (
    <section className="py-24 md:py-32" id="apps">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-[minmax(0,0.8fr)_minmax(18rem,0.55fr)] md:items-end md:justify-between">
          <h2 className="max-w-3xl text-balance font-heading text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            Apps I own
          </h2>
          <p className="max-w-xl text-pretty text-muted-foreground leading-7 md:justify-self-end">
            Small, focused products I take from idea to shipped experience—made
            for the everyday moments that deserve better tools.
          </p>
        </div>

        <div className="grid grid-flow-dense gap-4 md:grid-cols-12">
          {appLinks.map((app, index) => (
            <Card
              className={`group min-h-80 overflow-hidden transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-xl ${cardSpans[index]}`}
              key={app.href}
            >
              <CardHeader>
                <Badge variant="secondary">{app.platform}</Badge>
                <CardAction>
                  <Button asChild size="icon" variant="ghost">
                    <a
                      aria-label={`Visit ${app.label}`}
                      href={app.href}
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
                <div className="overflow-hidden rounded-2xl shadow-lg transition-transform duration-700 ease-out group-hover:scale-105">
                  <Image
                    alt={`${app.label} app logo`}
                    className="size-32 object-cover sm:size-40"
                    placeholder="blur"
                    src={appLogos[app.label]}
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-between text-muted-foreground text-sm">
                <span>{new URL(app.href).hostname}</span>
                <span>Owned product</span>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
