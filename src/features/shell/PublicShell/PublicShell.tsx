import Link from "next/link";
import { Suspense } from "react";
import { siteContent } from "@/shared/content/siteContent";
import type { Locale } from "@/shared/i18n/locales";
import { LocaleSelect } from "../LocaleSelect";
import { ThemeToggle } from "../ThemeToggle";
import styles from "./PublicShell.module.css";

export type PublicSection = "docs" | "download" | "update" | "about";

type PublicShellProps = {
  children: React.ReactNode;
  locale: Locale;
  activeSection: PublicSection;
};

export function PublicShell({ children, locale, activeSection }: PublicShellProps) {
  const content = siteContent[locale].shell;
  const docsHref = `/${locale}/docs`;

  return (
    <div className={styles.shell}>
      <div className={styles.banner}>
        <div className={styles.logo} />
      </div>
      <header className={styles.header}>
        <ThemeToggle />
        <nav aria-label={content.primaryNavigationLabel} className={styles.nav}>
          <Link
            aria-current={activeSection === "docs" ? "page" : undefined}
            className={styles.navLink}
            href={docsHref}
          >
            {content.navigation.docs}
          </Link>
          <Link
            aria-current={activeSection === "download" ? "page" : undefined}
            className={styles.navLink}
            href={`/${locale}/download`}
          >
            {content.navigation.download}
          </Link>
          <Link
            aria-current={activeSection === "update" ? "page" : undefined}
            className={styles.navLink}
            href={`/${locale}/update`}
          >
            {content.navigation.update}
          </Link>
          <Link
            aria-current={activeSection === "about" ? "page" : undefined}
            className={styles.navLink}
            href={`/${locale}/about`}
          >
            {content.navigation.about}
          </Link>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <strong>{content.footer.disclaimer}</strong>
        <Suspense fallback={<div className={styles.localeFallback} aria-hidden="true" />}>
          <LocaleSelect activeSection={activeSection} label={content.localeSwitcherLabel} locale={locale} />
        </Suspense>
      </footer>
    </div>
  );
}
