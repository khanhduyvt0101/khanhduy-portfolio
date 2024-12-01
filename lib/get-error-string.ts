import { t } from "i18next";
import isObject from "lodash/isObject";

export function getErrorString(error?: unknown): string {
  const parts = [
    (error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "") || t("error.message"),
  ];
  if (
    isObject(error) &&
    "digest" in error &&
    (typeof error.digest === "string" || typeof error.digest === "number")
  )
    parts.unshift(`(${error.digest})`);
  return parts.join(" ");
}
