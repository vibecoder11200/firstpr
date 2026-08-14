import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../i18n/en.json";
import vi from "../i18n/vi.json";

/**
 * i18n (C5): catalogs are the single source of truth. Default `en`; user
 * choice persisted in localStorage. Both catalogs ship together.
 */
const saved = typeof localStorage !== "undefined" ? localStorage.getItem("firstpr-lang") : null;

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    vi: { translation: vi },
  },
  lng: saved ?? "en",
  fallbackLng: "en",
  interpolation: { escapeValue: true }, // React already escapes; we escape too (HIGH-11)
});

export function setLanguage(lang: string) {
  void i18n.changeLanguage(lang);
  try {
    localStorage.setItem("firstpr-lang", lang);
  } catch {
    /* ignore */
  }
}

export default i18n;
