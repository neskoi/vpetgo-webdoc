import Link from "next/link";
import { Badge } from "@/shared/ui/Badge";
import { ImagePlaceholder } from "@/shared/ui/ImagePlaceholder";
import type { Locale } from "@/shared/i18n/locales";
import { DocArticle } from "./components/DocArticle";
import { docsContent, findDocSection } from "./content";
import styles from "./DocsPage.module.css";

type DocsPageProps = {
  locale: Locale;
  sectionId: string;
};

const currentVersion = "0.1";
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
        <aside className={styles.sidebar}>
          <h2>{content.sidebarTitle}</h2>
          <nav aria-label={content.sidebarTitle}>
            {content.sections.map((section) => (
              <div className={styles.navSection} key={section.id}>
                <Link
                  aria-current={section.id === sectionId ? "page" : undefined}
                  className={styles.sectionLink}
                  href={`/${locale}/docs/${section.id}`}
                >
                  {section.title}
                </Link>
                {section.id === sectionId ? (
                  <div className={styles.navChildren}>
                    {section.children.map((child) => (
                      <div className={styles.navItem} key={child.id}>
                        <a href={`#${child.id}`}>{child.title}</a>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </nav>
        </aside>
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
