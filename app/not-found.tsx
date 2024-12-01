import type { ReactNode } from "react";

import { Alert, Container } from "@mantine/core";
import { t } from "i18next";

export default function NotFound(): ReactNode {
  return (
    <Container my="xl">
      <Alert component="main" title={t("notFound.title")} variant="default">
        {t("notFound.message")}
      </Alert>
    </Container>
  );
}
