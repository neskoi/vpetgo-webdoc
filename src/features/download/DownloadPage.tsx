import Link from "next/link";
import { Badge } from "@/shared/ui/Badge";
import { ImagePlaceholder } from "@/shared/ui/ImagePlaceholder";
import { siteContent } from "@/shared/content/siteContent";
import type { Locale } from "@/shared/i18n/locales";
import styles from "./DownloadPage.module.css";

type DownloadPageProps = {
  locale: Locale;
};

const downloadUrl = "https://google.com";

export function DownloadPage({ locale }: DownloadPageProps) {
  const content = siteContent[locale].download;

  return (
    <section className={styles.page}>
      <div className={styles.copy}>
        <Badge>{content.badge}</Badge>
        <h1>{content.title}</h1>
        <p>{content.description}</p>
        <p className={styles.documentationPrompt}>
          <Link href={`/${locale}/docs/info#instalacao-vpet-go`}>{content.documentationPrompt}</Link>
        </p>
        <a className={styles.downloadLink} href={downloadUrl} rel="noreferrer" target="_blank">
          {content.action}
        </a>
      </div>
      <ImagePlaceholder alt={content.imageAlt} caption={content.imageCaption} aspectRatio="portrait" />
    </section>
  );
}
