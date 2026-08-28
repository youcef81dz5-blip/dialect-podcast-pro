import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { LANGUAGES, translate, type Lang } from "./translations";

const STORAGE_KEY = "sada-lang";

type I18nValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  dir: "rtl" | "ltr";
  t: (text: string) => string;
};

const I18nContext = createContext<I18nValue>({
  lang: "ar",
  setLang: () => {},
  dir: "rtl",
  t: (text) => text,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored && LANGUAGES.some((l) => l.code === stored)) setLangState(stored);
  }, []);

  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang]);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      setLang: (next: Lang) => {
        setLangState(next);
        window.localStorage.setItem(STORAGE_KEY, next);
      },
      t: (text: string) => translate(text, lang),
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export function useT() {
  return useI18n().t;
}
