import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { ThemeSwitch } from "~/components/theme-switch";
import { Button } from "~/components/ui/button";

export function SiteHeader(): ReactNode {
  return (
    <div className="sticky top-0 z-30 px-2 pt-2 sm:px-4 sm:pt-3">
      <header className="glass-frosted mx-auto grid w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center rounded-2xl px-2 py-1 sm:h-14 sm:gap-2 sm:px-3 sm:py-0">
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
          className="col-span-3 row-start-2 flex min-w-0 items-center justify-between sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:justify-center"
        >
          {[
            ["Discord Bot", "/#owner-products"],
            ["macOS Apps", "/#macos-apps"],
            ["iOS Apps", "/#ios-apps"],
            ["Developer", "/#developer-products"],
          ].map(([label, href]) => (
            <Button
              asChild
              className="h-9 px-1 text-xs sm:px-2 sm:text-sm"
              key={href}
              variant="link"
            >
              <Link href={href}>{label}</Link>
            </Button>
          ))}
        </nav>
        <div className="col-start-3 row-start-1">
          <ThemeSwitch />
        </div>
      </header>
    </div>
  );
}
