import {
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandThreads,
  IconBrandX,
  IconMail,
  IconTools,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

const socialLinks = [
  {
    href: "/free-tools",
    icon: IconTools,
    tooltip: "Free Tools",
    internal: true,
  },
  {
    href: "mailto:khanhduyvt0101@gmail.com",
    icon: IconMail,
    tooltip: "Mail",
  },
  {
    href: "https://www.linkedin.com/in/buitrongkhanhduy/",
    icon: IconBrandLinkedin,
    tooltip: "LinkedIn",
  },
  {
    href: "https://github.com/khanhduyvt0101",
    icon: IconBrandGithub,
    tooltip: "Github",
  },
  {
    href: "https://x.com/@khanhduyvt",
    icon: IconBrandX,
    tooltip: "X (Twitter)",
  },
  {
    href: "https://www.facebook.com/khanhduyvt0101",
    icon: IconBrandFacebook,
    tooltip: "Facebook",
  },
  {
    href: "https://www.threads.net/@_khanhduy",
    icon: IconBrandThreads,
    tooltip: "Threads",
  },
  {
    href: "https://www.instagram.com/_khanhduy",
    icon: IconBrandInstagram,
    tooltip: "Instagram",
  },
];

export function Infor(): ReactNode {
  return (
    <div className="relative box-border bg-gray-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="relative py-20 md:py-32 flex flex-col-reverse md:flex-row items-center justify-between gap-12">
          <div className="w-full md:max-w-lg lg:max-w-xl shrink-0">
            <h1 className="text-4xl md:text-5xl lg:text-[54px] font-black leading-tight text-foreground mb-4">
              Software Engineer{" "}
              <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                & Product Builder
              </span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mt-4">
              Hello, I&apos;m Khanh Duy, a Software Engineer based in Ho Chi
              Minh City. I build practical web, iOS, and macOS products. My
              current work centers on LofiHood, SpotterFuel, CampusCue, and
              WakeArc, plus CafeSignal.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <TooltipProvider delayDuration={100}>
                {socialLinks.map(({ href, icon: Icon, tooltip, internal }) => (
                  <Tooltip key={href}>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        variant="outline"
                        size="icon"
                        className="rounded-full w-12 h-12"
                      >
                        {internal ? (
                          <Link href={href}>
                            <Icon className="w-[70%] h-[70%] stroke-[1.5px]" />
                          </Link>
                        ) : (
                          <a href={href} target="_blank" rel="noreferrer">
                            <Icon className="w-[70%] h-[70%] stroke-[1.5px]" />
                          </a>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </div>
          <div className="relative aspect-square w-full max-w-[300px] flex-1 shrink-0 overflow-hidden rounded-xl shadow-sm md:max-w-[400px]">
            <Image
              alt="Khanh Duy Avatar"
              src="/avatar.webp"
              fill
              loading="eager"
              sizes="(max-width: 768px) 300px, 400px"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
