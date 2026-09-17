import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/shared/ui/Badge";
import { siteContent } from "@/shared/content/siteContent";
import type { Locale } from "@/shared/i18n/locales";
import styles from "./DownloadPage.module.css";

type DownloadPageProps = {
  locale: Locale;
};

function getDownloadUrl() {
  const value = process.env.VPETGO_DOWNLOAD_URL;

  if (!value) {
    throw new Error("VPETGO_DOWNLOAD_URL environment variable is required.");
  }

  const url = new URL(value);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("VPETGO_DOWNLOAD_URL must use the http or https protocol.");
  }

  return url.toString();
}

export function DownloadPage({ locale }: DownloadPageProps) {
  const content = siteContent[locale].download;
  const downloadUrl = getDownloadUrl();

  return (
    <section className={styles.page}>
      <div className={styles.copy}>
        <Badge>{content.badge}</Badge>
        <h1>{content.title}</h1>
        <p>{content.description}</p>
        <p className={styles.documentationPrompt}>
          <Link href={`/${locale}/docs`}>{content.documentationPrompt}</Link>
        </p>
        <a className={styles.downloadLink} href={downloadUrl} rel="noreferrer" target="_blank">
          {content.action}
        </a>
      </div>
      <figure className={styles.figure}>
        <Image
          alt={content.imageAlt}
          className={styles.artwork}
          height={853}
          sizes="(max-width: 760px) calc(100vw - 2rem), 360px"
          src="/assets/workingAgumon.webp"
          width={864}
        />
        {content.imageCaption ? (
          <figcaption className={styles.caption}>{content.imageCaption}</figcaption>
        ) : null}
      </figure>
    </section>
  );
}
