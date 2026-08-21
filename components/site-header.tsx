import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { ThemeSwitch } from "~/components/theme-switch";
import { Button } from "~/components/ui/button";

export function SiteHeader(): ReactNode {
  return (
    <div className="sticky top-0 z-30 px-2 pt-2 sm:px-4 sm:pt-3">
      <header className="glass-frosted mx-auto grid h-14 w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-1 rounded-2xl px-2 sm:gap-4 sm:px-3">
        <Button asChild className="h-10 px-1.5 sm:px-2" variant="ghost">
          <Link
            aria-label="Khanh Duy home"
            href="/"
            transitionTypes={["nav-forward"]}
          >
            <Image
              alt=""
              aria-hidden="true"
              className="h-auto w-14 dark:invert sm:w-20"
              height={56}
              priority
              src="/brand/kd-signature.svg"
              width={176}
            />
          </Link>
        </Button>
        <nav
          aria-label="Product showcases"
          className="flex min-w-0 items-center justify-center"
        >
          <Button
            asChild
            className="h-9 px-2 text-xs sm:px-3 sm:text-sm"
            variant="link"
          >
            <Link href="/#owner-products">Owner products</Link>
          </Button>
          <Button
            asChild
            className="h-9 px-2 text-xs sm:px-3 sm:text-sm"
            variant="link"
          >
            <Link href="/#developer-products">Developer products</Link>
          </Button>
        </nav>
        <ThemeSwitch />
      </header>
    </div>
  );
}
