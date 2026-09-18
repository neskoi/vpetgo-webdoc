"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { supportedLocales, type Locale } from "@/shared/i18n/locales";
import type { PublicSection } from "../PublicShell/PublicShell";
import styles from "./LocaleSelect.module.css";

type LocaleSelectProps = {
  activeSection: PublicSection;
  label: string;
  locale: Locale;
};

const localeLabels: Record<Locale, string> = {
  en: "English",
  "pt-BR": "Português"
};

const localeFlags: Record<Locale, string> = {
  en: "🇺🇸",
  "pt-BR": "🇧🇷"
};

export function LocaleSelect({ activeSection, label, locale }: LocaleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  function selectLocale(nextLocale: Locale) {
    setIsOpen(false);

    if (nextLocale !== locale) {
      const pathParts = pathname.split("/");
      pathParts[1] = nextLocale;
      const search = searchParams.toString();
      const hash = window.location.hash;
      const nextPath = `${pathParts.join("/") || `/${nextLocale}/${activeSection}`}${search ? `?${search}` : ""}${hash}`;

      router.push(nextPath);
    }
  }

  return (
    <div className={styles.localeSwitcher}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={label}
        className={styles.localeButton}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        type="button"
      >
        <span aria-hidden="true">{localeFlags[locale]}</span>
      </button>
      {isOpen ? (
        <div aria-label={label} className={styles.localeMenu} role="listbox">
          {supportedLocales.map((supportedLocale) => (
            <button
              aria-selected={supportedLocale === locale}
              className={styles.localeOption}
              key={supportedLocale}
              onClick={() => selectLocale(supportedLocale)}
              role="option"
              type="button"
            >
              <span aria-hidden="true">{localeFlags[supportedLocale]}</span>
              <span>{localeLabels[supportedLocale]}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
