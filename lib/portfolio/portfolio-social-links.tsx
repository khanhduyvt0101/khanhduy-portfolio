"use client";

import {
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandThreads,
  IconBrandX,
  IconMail,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { trackSiteEvent } from "~/lib/site/analytics-events";
import { cn } from "~/lib/utils";

const email = "khanhduyvt0101@gmail.com";

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/khanhduyvt0101",
    icon: IconBrandGithub,
    tone: "bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-white/90",
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
    href: "https://www.instagram.com/_khanhduy",
    icon: IconBrandInstagram,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/khanhduyvt0101",
    icon: IconBrandFacebook,
  },
  {
    label: "Email",
    href: `mailto:${email}`,
    icon: IconMail,
  },
];

export function PortfolioSocialLinks(): ReactNode {
  return (
    <TooltipProvider delayDuration={120}>
      <div className="flex flex-wrap gap-2">
        {socialLinks.map(({ href, icon: Icon, label, tone }) => (
          <Tooltip key={href}>
            <TooltipTrigger asChild>
              <Button
                asChild
                className={cn(
                  "size-12 rounded-lg p-0",
                  tone ?? "bg-background/80",
                )}
                size="sm"
                variant={tone ? "default" : "outline"}
              >
                <a
                  aria-label={label}
                  href={href}
                  onClick={() =>
                    trackSiteEvent("Social Link Clicked", {
                      platform: label,
                    })
                  }
                  rel="noreferrer"
                  target="_blank"
                >
                  <Icon className="size-5" stroke={1.8} />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
