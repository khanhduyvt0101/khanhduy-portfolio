import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "~/components/ui/button";

export default function NotFound(): ReactNode {
  return (
    <section className="container mx-auto grid min-h-[70svh] max-w-2xl place-content-center px-4 py-16 text-center">
      <div className="glass-frosted rounded-2xl p-8 sm:p-12">
        <h1 className="text-5xl font-semibold">404</h1>
        <p className="mt-4 text-muted-foreground">
          The page you are looking for does not exist or has moved.
        </p>
        <Button asChild className="mt-8" size="lg">
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </section>
  );
}
