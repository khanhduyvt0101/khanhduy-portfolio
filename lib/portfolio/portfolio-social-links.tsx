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
    href: "https://www.instagram.com/_khanhduy/",
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
    <div className="flex flex-wrap gap-2">
      {socialLinks.map(({ href, icon: Icon, label, tone }) => {
        const external = !href.startsWith("mailto:");

        return (
          <Button
            asChild
            className={cn(
              "group relative size-12 overflow-visible rounded-lg p-0",
              tone ?? "bg-background/80",
            )}
            key={href}
            size="sm"
            variant={tone ? "default" : "outline"}
          >
            <a
              aria-label={label}
              href={href}
              rel={external ? "noreferrer" : undefined}
              target={external ? "_blank" : undefined}
              title={label}
            >
              <Icon className="size-5" stroke={1.8} />
              <span
                aria-hidden="true"
                className="-translate-x-1/2 pointer-events-none absolute bottom-[calc(100%+0.5rem)] left-1/2 z-20 rounded-md border bg-popover px-2.5 py-1.5 text-popover-foreground text-xs opacity-0 shadow-md transition-[opacity,transform] duration-150 group-hover:-translate-y-0.5 group-hover:opacity-100 group-focus-visible:-translate-y-0.5 group-focus-visible:opacity-100"
              >
                {label}
              </span>
            </a>
          </Button>
        );
      })}
    </div>
  );
}
