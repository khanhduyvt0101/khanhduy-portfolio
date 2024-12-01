import type { ReactNode } from "react";

import { isValidElement } from "react";

import { getErrorString } from "~/lib/get-error-string";

export function getErrorText(error?: unknown): ReactNode {
  return isValidElement(error) ? error : getErrorString(error);
}
