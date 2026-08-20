"use client";

import { ThemeProvider as NextThemes } from "next-themes";
import type * as React from "react";
import { TooltipProvider } from "~/components/ui/tooltip";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemes>) {
  return (
    <NextThemes {...props}>
      <TooltipProvider>{children}</TooltipProvider>
    </NextThemes>
  );
}
