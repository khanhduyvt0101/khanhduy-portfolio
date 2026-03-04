import {
  IconArticle,
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandThreads,
  IconBrandX,
  IconMail,
} from "@tabler/icons-react";
import { t } from "i18next";
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
    href: "https://blog.khanhduy.com",
    icon: IconArticle,
    tooltip: "Blog",
    color: "text-cyan-500",
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
              {t("infor:title")}{" "}
              <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                & Product Builder
              </span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mt-4">
              {t("infor:description")}
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <TooltipProvider delayDuration={100}>
                {socialLinks.map(({ href, icon: Icon, tooltip, color }) => (
                  <Tooltip key={href}>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        variant="outline"
                        size="icon"
                        className="rounded-full w-12 h-12"
                      >
                        <a href={href} target="_blank" rel="noreferrer">
                          <Icon
                            className={`w-[70%] h-[70%] stroke-[1.5px] ${color || ""}`}
                          />
                        </a>
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
          <div className="w-full max-w-[300px] md:max-w-[400px] flex-1 shrink-0">
            <img
              alt="Khanh Duy Avatar"
              src="avatar.webp"
              className="w-full h-auto rounded-xl shadow-sm object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
