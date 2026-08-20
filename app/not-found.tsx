import Link from "next/link";
import type { ReactNode } from "react";

export default function NotFound(): ReactNode {
  return (
    <section className="container mx-auto grid min-h-[60svh] max-w-2xl place-content-center px-4 py-16 text-center">
      <h1 className="text-5xl font-semibold">404</h1>
      <p className="mt-4 text-muted-foreground">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        className="mx-auto mt-8 w-fit underline decoration-border underline-offset-4 transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
        href="/"
      >
        Return home
      </Link>
    </section>
  );
}
