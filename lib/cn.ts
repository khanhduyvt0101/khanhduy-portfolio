import type { CxOptions, CxReturn } from "class-variance-authority";

import { cx } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export function cn(...options: CxOptions): CxReturn {
  return twMerge(cx(...options));
}
