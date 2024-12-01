import "~/i18next.config";

import i18next from "i18next";

if (!i18next.resolvedLanguage) throw new Error("Failed to resolve language");

export const language = i18next.resolvedLanguage;
