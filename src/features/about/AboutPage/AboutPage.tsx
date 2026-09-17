import Image from "next/image";
import { Badge } from "@/shared/ui/Badge";
import { siteContent } from "@/shared/content/siteContent";
import type { Locale } from "@/shared/i18n/locales";
import styles from "./AboutPage.module.css";

type AboutPageProps = {
  locale: Locale;
};

export function AboutPage({ locale }: AboutPageProps) {
  const content = siteContent[locale].about;

  return (
    <section className={styles.page}>
      <div className={styles.copy}>
        <Badge>{content.disclaimer}</Badge>
        <h1>{content.title}</h1>
        <p>{content.description}</p>
        <p>{content.inspiration}</p>
      </div>
      <figure className={styles.figure}>
        <Image
          alt={content.imageAlt}
          className={styles.artwork}
          height={1222}
          sizes="(max-width: 760px) calc(100vw - 3rem), 360px"
          src="/assets/palmonHoldingGo.jpeg"
          width={864}
        />
        {content.imageCaption ? (
          <figcaption className={styles.caption}>{content.imageCaption}</figcaption>
        ) : null}
      </figure>
    </section>
  );
}
