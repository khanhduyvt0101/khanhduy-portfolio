import { use as install } from "i18next";
import { initReactI18next } from "react-i18next/initReactI18next";

import config from "~/config.json";
import * as i18n from "~/i18n";

void install(initReactI18next).init({
  interpolation: { escapeValue: false },
  lng: config.locale,
  fallbackLng: config.locale,
  supportedLngs: [config.locale],
  resources: { [config.locale]: i18n },
});
