"use client";

import type { ReactNode } from "react";

import { Alert, Container } from "@mantine/core";
import { t } from "i18next";

import { getErrorText } from "~/lib/get-error-text";

interface Props {
  error: unknown;
  reset: () => void;
}

export default function Error({ error, reset }: Props): ReactNode {
  return (
    <Container my="xl">
      <Alert
        withCloseButton
        closeButtonLabel={t("error.close")}
        component="main"
        title={t("error.title")}
        variant="default"
        onClose={reset}
      >
        {getErrorText(error)}
      </Alert>
    </Container>
  );
}
