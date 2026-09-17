import { Badge } from "@/shared/ui/Badge";
import { ImagePlaceholder } from "@/shared/ui/ImagePlaceholder";
import type { Locale } from "@/shared/i18n/locales";
import { DocArticle } from "./components/DocArticle";
import { docsContent, resolveVersionedText } from "./content";
import styles from "./DocsPage.module.css";

type DocsPageProps = {
  locale: Locale;
};

const currentVersion = "0.1";
const articleColors = [
  { bodyColor: "var(--color-sky-dark)", textColor: "var(--color-white)" },
  { bodyColor: "var(--color-purple)", textColor: "var(--color-white)" },
  { bodyColor: "var(--color-pink)", textColor: "var(--color-white)" }
];

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
            <DocArticle
              bodyColor={articleColors[index % articleColors.length].bodyColor}
              id={block.id}
              key={block.id}
              textColor={articleColors[index % articleColors.length].textColor}
              title={block.title}
            >
              {resolveVersionedText(block, currentVersion)}
            </DocArticle>
          ))}
        </div>
      </div>
    </div>
  );
}
