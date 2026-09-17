import { Badge } from "@/shared/ui/Badge";
import { ImagePlaceholder } from "@/shared/ui/ImagePlaceholder";
import type { Locale } from "@/shared/i18n/locales";
import { docsContent, resolveVersionedText } from "./content";
import styles from "./DocsPage.module.css";

type DocsPageProps = {
  locale: Locale;
};

const currentVersion = "0.1";

export function DocsPage({ locale }: DocsPageProps) {
  const content = docsContent[locale];

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <Badge>{content.versionLabel} {currentVersion}</Badge>
          <h1>{content.title}</h1>
          <p>{content.intro}</p>
        </div>
        <ImagePlaceholder
          alt={locale === "en" ? "Pixel style guide artwork space" : "Espaco para arte de guia em estilo pixel"}
          aspectRatio="square"
        />
      </section>
      <div className={styles.docsLayout}>
        <aside className={styles.sidebar}>
          <h2>{content.sidebarTitle}</h2>
          <nav aria-label={content.sidebarTitle}>
            {content.blocks.map((block) => (
              <a href={`#${block.id}`} key={block.id}>
                {block.title}
              </a>
            ))}
          </nav>
        </aside>
        <div className={styles.blocks}>
          {content.blocks.map((block, index) => (
            <article className={styles.block} id={block.id} key={block.id}>
              <div className={styles.blockHeader} data-accent={index % 3}>
                <span>{content.sectionLabels[block.section]}</span>
                <h2>{block.title}</h2>
              </div>
              <p>{resolveVersionedText(block, currentVersion)}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
