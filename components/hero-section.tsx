import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import facebookLogo from "~/assets/platforms/facebook.svg";
import githubLogo from "~/assets/platforms/github.svg";
import gmailLogo from "~/assets/platforms/gmail.svg";
import hevyLogo from "~/assets/platforms/hevy.svg";
import instagramLogo from "~/assets/platforms/instagram.svg";
import linkedinLogo from "~/assets/platforms/linkedin.svg";
import stravaLogo from "~/assets/platforms/strava.svg";
import threadsLogo from "~/assets/platforms/threads.svg";
import xLogo from "~/assets/platforms/x.svg";
import { HeroCarousel } from "~/components/hero-carousel";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { defaultSeoDescription } from "~/lib/seo";

interface SocialLink {
  label: string;
  href: string;
  logo: StaticImageData;
  invertInDark?: boolean;
}

const socialLinks: SocialLink[] = [
  {
    label: "Email",
    href: "mailto:khanhduyvt0101@gmail.com",
    logo: gmailLogo,
  },
  {
    label: "GitHub",
    href: "https://github.com/khanhduyvt0101",
    logo: githubLogo,
    invertInDark: true,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/buitrongkhanhduy/",
    logo: linkedinLogo,
  },
  {
    label: "X",
    href: "https://x.com/khanhduyvt",
    logo: xLogo,
    invertInDark: true,
  },
  {
    label: "Threads",
    href: "https://www.threads.net/@_khanhduy",
    logo: threadsLogo,
    invertInDark: true,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/_khanhduy/",
    logo: instagramLogo,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/khanhduyvt0101",
    logo: facebookLogo,
  },
];

const fitnessLinks: SocialLink[] = [
  {
    label: "Strava",
    href: "https://strava.app.link/cPWy22txK5b",
    logo: stravaLogo,
  },
  {
    label: "Hevy",
    href: "https://hevy.com/user/khanhduyvt0101",
    logo: hevyLogo,
    invertInDark: true,
  },
];

export function HeroSection(): ReactNode {
  return (
    <section
      className="relative isolate flex min-h-[calc(100svh-4rem)] items-center overflow-hidden"
      id="hero"
    >
      <div className="absolute top-[12%] right-[-8rem] -z-10 size-[26rem] rounded-full bg-primary/15 blur-3xl motion-safe:animate-pulse" />
      <div className="absolute bottom-[8%] left-[-7rem] -z-10 size-[22rem] rounded-full bg-chart-2/15 blur-3xl" />
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)] md:py-24 lg:gap-20 lg:px-8">
        <div className="flex max-w-3xl flex-col items-start gap-6">
          <h1 className="max-w-3xl text-balance font-heading text-6xl font-semibold tracking-[-0.03em] sm:text-7xl lg:text-8xl">
            Khanh Duy
          </h1>
          <p className="max-w-2xl text-balance text-xl leading-8 text-foreground sm:text-2xl sm:leading-9">
            Builds small apps for everyday friction.
          </p>
          <p className="max-w-[68ch] text-base leading-7 text-muted-foreground">
            {defaultSeoDescription}
          </p>
          <div className="glass-surface grid w-full max-w-2xl gap-3 rounded-2xl p-4 sm:p-5">
            <div className="grid grid-cols-[4.5rem_1fr] items-center gap-3">
              <p className="text-sm font-medium text-muted-foreground">
                Social
              </p>
              <nav
                aria-label="Khanh Duy social and contact links"
                className="flex flex-wrap gap-2"
              >
                {socialLinks.map(({ href, invertInDark, label, logo }) => {
                  const external = !href.startsWith("mailto:");

                  return (
                    <Tooltip key={href}>
                      <TooltipTrigger asChild>
                        <Button asChild size="icon-lg" variant="outline">
                          <a
                            aria-label={label}
                            href={href}
                            rel={external ? "noreferrer" : undefined}
                            target={external ? "_blank" : undefined}
                          >
                            <Image
                              alt=""
                              aria-hidden="true"
                              className={
                                invertInDark ? "dark:invert" : undefined
                              }
                              height={18}
                              src={logo}
                              unoptimized
                              width={18}
                            />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">{label}</TooltipContent>
                    </Tooltip>
                  );
                })}
              </nav>
            </div>
            <Separator />
            <div className="grid grid-cols-[4.5rem_1fr] items-center gap-3">
              <p className="text-sm font-medium text-muted-foreground">
                Fitness
              </p>
              <nav
                aria-label="Khanh Duy fitness profiles"
                className="flex flex-wrap gap-2"
              >
                {fitnessLinks.map(({ href, invertInDark, label, logo }) => (
                  <Button asChild key={href} size="lg" variant="outline">
                    <a href={href} rel="noreferrer" target="_blank">
                      <Image
                        alt=""
                        aria-hidden="true"
                        className={invertInDark ? "dark:invert" : undefined}
                        height={18}
                        src={logo}
                        unoptimized
                        width={18}
                      />
                      {label}
                    </a>
                  </Button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm md:justify-self-end">
          <HeroCarousel />
        </div>
      </div>
    </section>
  );
}
