import type { ReactNode } from "react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { appLinks } from "~/lib/profile";

const footerGroups = [
  {
    label: "Apps",
    links: appLinks,
  },
  {
    label: "Connect",
    links: [
      { label: "Email", href: "mailto:khanhduyvt0101@gmail.com" },
      { label: "GitHub", href: "https://github.com/khanhduyvt0101" },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/buitrongkhanhduy/",
      },
    ],
  },
];

export function SiteFooter(): ReactNode {
  return (
    <footer className="mt-auto">
      <Separator />
      <div className="container mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.2fr_repeat(2,minmax(0,1fr))]">
        <div>
          <p className="text-sm font-bold text-foreground">Khanh Duy</p>
          <p className="mt-3 max-w-sm text-muted-foreground text-sm leading-6">
            Product builder in Ho Chi Minh City shipping practical apps for
            focus, fitness, family logistics, sleep, and public Wi-Fi.
          </p>
        </div>
        {footerGroups.map((group) => (
          <nav aria-label={group.label} key={group.label}>
            <h2 className="text-sm font-bold text-foreground">{group.label}</h2>
            <ul className="mt-3 grid gap-2 text-muted-foreground text-sm">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Button asChild className="h-auto p-0" variant="link">
                    <a
                      href={link.href}
                      rel={
                        link.href.startsWith("http") ? "noreferrer" : undefined
                      }
                      target={
                        link.href.startsWith("http") ? "_blank" : undefined
                      }
                    >
                      {link.label}
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <Separator />
      <div className="px-4 py-5 text-center text-muted-foreground text-xs">
        Made by Khanh Duy. Ho Chi Minh City, Vietnam.
      </div>
    </footer>
  );
}
