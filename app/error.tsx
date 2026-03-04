"use client";

import { IconAlertCircle } from "@tabler/icons-react";
import { t } from "i18next";
import type { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { getErrorText } from "~/lib/get-error-text";

interface Props {
  error: unknown;
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: Props): ReactNode {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <Alert variant="destructive">
        <IconAlertCircle className="h-4 w-4" />
        <AlertTitle>{t("error.title")}</AlertTitle>
        <AlertDescription className="mt-2 flex flex-col gap-4">
          <p>{getErrorText(error)}</p>
          <div>
            <Button onClick={reset} variant="outline" size="sm">
              {t("error.close") || "Try again"}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
