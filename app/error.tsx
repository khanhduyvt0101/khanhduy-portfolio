"use client";

import { IconAlertCircle } from "@tabler/icons-react";
import type { ReactNode } from "react";
import {
  Banner,
  BannerActions,
  BannerContent,
  BannerDescription,
  BannerIcon,
  BannerTitle,
} from "~/components/ui/banner";
import { Button } from "~/components/ui/button";
import { getErrorText } from "~/lib/get-error-text";

interface Props {
  error: unknown;
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: Props): ReactNode {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <Banner variant="destructive" dismissible={false}>
        <BannerIcon asChild>
          <IconAlertCircle />
        </BannerIcon>
        <BannerContent>
          <BannerTitle>Error</BannerTitle>
          <BannerDescription>{getErrorText(error)}</BannerDescription>
        </BannerContent>
        <BannerActions>
          <Button onClick={reset} variant="outline" size="sm">
            Try again
          </Button>
        </BannerActions>
      </Banner>
    </div>
  );
}
