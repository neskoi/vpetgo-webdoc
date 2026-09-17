import { Badge } from "@/shared/ui/Badge";
import { ImagePlaceholder } from "@/shared/ui/ImagePlaceholder";
import type { Locale } from "@/shared/i18n/locales";
import { aboutContent } from "./content";
import styles from "./AboutPage.module.css";

type AboutPageProps = {
  locale: Locale;
};

export function AboutPage({ locale }: AboutPageProps) {
  const content = aboutContent[locale];

  return (
    <section className={styles.page}>
      <div className={styles.copy}>
        <Badge>{content.disclaimer}</Badge>
        <h1>{content.title}</h1>
        <p>{content.description}</p>
        <p>{content.inspiration}</p>
        <strong className={styles.disclaimer}>{content.disclaimer}</strong>
      </div>
      <ImagePlaceholder alt={content.imageAlt} caption={content.imageCaption} aspectRatio="portrait" />
    </section>
  );
}
