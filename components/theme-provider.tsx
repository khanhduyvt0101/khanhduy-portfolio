"use client";

import { ThemeProvider as NextThemes } from "next-themes";
import type * as React from "react";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemes>) {
  return <NextThemes {...props}>{children}</NextThemes>;
}
