import { siteContent } from "@/shared/content/siteContent";
import type { Locale } from "@/shared/i18n/locales";
import { Badge } from "@/shared/ui/Badge";
import { UpdaterPanel } from "../UpdaterPanel";
import styles from "./UpdaterPage.module.css";

type UpdaterPageProps = {
  locale: Locale;
};

export function UpdaterPage({ locale }: UpdaterPageProps) {
  const content = siteContent[locale].updater;

  return (
    <section className={styles.page}>
      <header className={styles.intro}>
        <Badge>{content.badge}</Badge>
        <h1>{content.title}</h1>
        <p>{content.description}</p>
        <p className={styles.browserNote}>{content.browserNote}</p>
      </header>
      <UpdaterPanel copy={content.panel} />
    </section>
  );
}
