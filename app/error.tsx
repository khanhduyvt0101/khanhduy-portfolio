"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "~/components/ui/button";

interface Props {
  reset: () => void;
}

export default function ErrorBoundary({ reset }: Props): ReactNode {
  return (
    <section className="container mx-auto grid min-h-[70svh] max-w-2xl place-content-center px-4 py-16 text-center">
      <div className="glass-frosted rounded-2xl p-8 sm:p-12">
        <h1 className="text-4xl font-semibold">Something went wrong</h1>
        <p className="mt-4 text-muted-foreground">
          The page could not load. Reload it or return to the homepage.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={reset} type="button">
            Reload page
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
