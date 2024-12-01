"use client";

import "~/i18next.config";

import type { PropsWithChildren, ReactNode } from "react";

export function I18nextProvider({ children }: PropsWithChildren): ReactNode {
  return children;
}
