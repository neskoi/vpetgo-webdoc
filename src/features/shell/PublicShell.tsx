import Link from "next/link";
import { siteContent } from "@/shared/content/siteContent";
import type { Locale } from "@/shared/i18n/locales";
import { LocaleSelect } from "./LocaleSelect";
import styles from "./PublicShell.module.css";

type PublicShellProps = {
  children: React.ReactNode;
  locale: Locale;
  activeSection: "docs" | "download" | "about";
};

export function PublicShell({ children, locale, activeSection }: PublicShellProps) {
  const content = siteContent[locale].shell;
  const docsHref = `/${locale}/docs`;

  return (
    <div className={styles.shell}>
      <div className={styles.banner}>
        <div className={styles.logo}/>
      </div>
      <header className={styles.header}>
        <Link className={styles.brand} href={docsHref}>
          <span className={styles.mark} aria-hidden="true">
            VP
          </span>
          <span>VPET GO</span>
        </Link>
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
            aria-current={activeSection === "about" ? "page" : undefined}
            className={styles.navLink}
            href={`/${locale}/about`}
          >
            {content.navigation.about}
          </Link>
        </nav>
        <LocaleSelect activeSection={activeSection} label={content.localeSwitcherLabel} locale={locale} />
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <span>{content.footer.status}</span>
        <strong>{content.footer.disclaimer}</strong>
      </footer>
    </div>
  );
}
