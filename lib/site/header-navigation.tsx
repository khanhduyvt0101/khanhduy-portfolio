"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

const navItems = [
  { label: "Apps", href: "/#apps" },
  { label: "Workbench", href: "/#workbench" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "mailto:khanhduyvt0101@gmail.com", external: true },
];

export function HeaderNavigation(): ReactNode {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="hidden items-center gap-1 text-sm font-semibold md:flex"
    >
      {navItems.map((item) =>
        item.external ? (
          <a
            className="rounded-lg px-2.5 py-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
            href={item.href}
            key={item.href}
          >
            {item.label}
          </a>
        ) : (
          <Link
            className={cn(
              "rounded-lg px-2.5 py-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70",
              pathname === "/" && "text-foreground",
            )}
            href={item.href}
            key={item.href}
            transitionTypes={["nav-forward"]}
          >
            {item.label}
          </Link>
        ),
      )}
    </nav>
  );
}
