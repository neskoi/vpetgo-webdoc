import { Badge } from "@/shared/ui/Badge";
import { ImagePlaceholder } from "@/shared/ui/ImagePlaceholder";
import type { Locale } from "@/shared/i18n/locales";
import { DocArticle } from "./components/DocArticle";
import { DocsSidebar } from "./components/DocsSidebar";
import { docsContent, findDocSection } from "./content";
import styles from "./DocsPage.module.css";

type DocsPageProps = {
  locale: Locale;
  sectionId: string;
};

const currentVersion = "1.7.0";
const articleColors = [
  { bodyColor: "var(--color-sky-dark)", textColor: "var(--color-white)" },
  { bodyColor: "var(--color-purple)", textColor: "var(--color-white)" },
  { bodyColor: "var(--color-pink)", textColor: "var(--color-white)" }
];

export function DocsPage({ locale, sectionId }: DocsPageProps) {
  const content = docsContent[locale];
  const activeSection = findDocSection(locale, sectionId);

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
        <DocsSidebar
          activeSectionId={sectionId}
          label={content.sidebarTitle}
          locale={locale}
          sections={content.sections}
          title={content.sidebarTitle}
        />
        <div className={styles.blocks}>
          {activeSection ? (
            <>
              <header className={styles.sectionHeader}>
                <h2>{activeSection.title}</h2>
              </header>
              <DocArticle
                bodyColor={articleColors[0].bodyColor}
                content={activeSection.content}
                currentVersion={currentVersion}
                id={`${activeSection.id}-overview`}
                textColor={articleColors[0].textColor}
                title={activeSection.title}
              />
              {activeSection.children.map((child, index) => (
                <DocArticle
                  bodyColor={articleColors[(index + 1) % articleColors.length].bodyColor}
                  content={child.content}
                  currentVersion={currentVersion}
                  id={child.id}
                  key={child.id}
                  textColor={articleColors[(index + 1) % articleColors.length].textColor}
                  title={child.title}
                />
              ))}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
