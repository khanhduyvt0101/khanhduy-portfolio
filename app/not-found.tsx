import { IconAlertCircle } from "@tabler/icons-react";
import { t } from "i18next";
import type { ReactNode } from "react";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export default function NotFound(): ReactNode {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <Alert>
        <IconAlertCircle className="h-4 w-4" />
        <AlertTitle>{t("notFound.title")}</AlertTitle>
        <AlertDescription className="mt-2">
          {t("notFound.message")}
        </AlertDescription>
      </Alert>
    </div>
  );
}
