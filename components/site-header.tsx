import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { ThemeSwitch } from "~/components/theme-switch";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

export function SiteHeader(): ReactNode {
  return (
    <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md">
      <header className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Button asChild className="h-10 px-2" variant="ghost">
          <Link
            aria-label="Khanh Duy home"
            href="/"
            transitionTypes={["nav-forward"]}
          >
            <Image
              alt=""
              aria-hidden="true"
              className="h-auto w-20 dark:invert"
              height={56}
              priority
              src="/brand/kd-signature.svg"
              width={176}
            />
          </Link>
        </Button>
        <ThemeSwitch />
      </header>
      <Separator />
    </div>
  );
}
