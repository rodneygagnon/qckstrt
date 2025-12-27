import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "@/locales/en/common.json";
import enSettings from "@/locales/en/settings.json";
import esCommon from "@/locales/es/common.json";
import esSettings from "@/locales/es/settings.json";

export const defaultNS = "common";
export const supportedLanguages = ["en", "es"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const resources = {
  en: {
    common: enCommon,
    settings: enSettings,
  },
  es: {
    common: esCommon,
    settings: esSettings,
  },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  defaultNS,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
