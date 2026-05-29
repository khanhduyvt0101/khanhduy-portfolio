"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

const LazyHeaderNavigation = dynamic(
  () =>
    import("~/lib/site/header-navigation").then(
      (module) => module.HeaderNavigation,
    ),
  { ssr: false },
);

export function HeaderNavigationLoader(): ReactNode {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setReady(true), 1400);

    return () => window.clearTimeout(timeoutId);
  }, []);

  if (ready) {
    return <LazyHeaderNavigation />;
  }

  return (
    <nav
      aria-label="Primary"
      className="hidden items-center gap-1 text-sm font-semibold md:flex"
    >
      <Link
        className="rounded-lg px-2.5 py-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
        href="/#apps"
        transitionTypes={["nav-forward"]}
      >
        Apps
      </Link>
      <Link
        className="rounded-lg px-2.5 py-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
        href="/#workbench"
        transitionTypes={["nav-forward"]}
      >
        Workbench
      </Link>
      <Link
        className="rounded-lg px-2.5 py-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
        href="/#about"
        transitionTypes={["nav-forward"]}
      >
        About
      </Link>
      <a
        className="rounded-lg px-2.5 py-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
        href="mailto:khanhduyvt0101@gmail.com"
      >
        Contact
      </a>
    </nav>
  );
}
