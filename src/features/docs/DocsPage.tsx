"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/shared/ui/Badge";
import { ImagePlaceholder } from "@/shared/ui/ImagePlaceholder";
import { findDocSection, getDefaultDocSectionId, getDocSectionIds, siteContent } from "@/shared/content/siteContent";
import type { Locale } from "@/shared/i18n/locales";
import { DocArticle } from "./components/DocArticle";
import { DocsSidebar } from "./components/DocsSidebar";
import styles from "./DocsPage.module.css";

type DocsPageProps = {
  locale: Locale;
};

const currentVersion = "1.7.0";
const articleColors = [
  { bodyColor: "var(--color-sky-dark)", textColor: "var(--color-white)" },
  { bodyColor: "var(--color-purple)", textColor: "var(--color-white)" },
  { bodyColor: "var(--color-pink)", textColor: "var(--color-white)" }
];

function readSectionIdFromUrl(validSectionIds: string[], defaultSectionId: string): string {
  const sectionId = new URLSearchParams(window.location.search).get("section");

  return sectionId && validSectionIds.includes(sectionId) ? sectionId : defaultSectionId;
}

export function DocsPage({ locale }: DocsPageProps) {
  const content = siteContent[locale].docs;
  const defaultSectionId = getDefaultDocSectionId(locale);
  const validSectionIds = useMemo(() => getDocSectionIds(locale), [locale]);
  const [sectionId, setSectionId] = useState(defaultSectionId);
  const activeSection = findDocSection(locale, sectionId);

  useEffect(() => {
    function syncSectionFromUrl() {
      setSectionId(readSectionIdFromUrl(validSectionIds, defaultSectionId));
    }

    window.setTimeout(syncSectionFromUrl, 0);
    window.addEventListener("popstate", syncSectionFromUrl);

    return () => window.removeEventListener("popstate", syncSectionFromUrl);
  }, [defaultSectionId, validSectionIds]);

  function selectSection(nextSectionId: string, childId?: string) {
    if (!validSectionIds.includes(nextSectionId)) {
      return;
    }

    const nextUrl = new URL(window.location.href);

    if (nextSectionId === defaultSectionId) {
      nextUrl.searchParams.delete("section");
    } else {
      nextUrl.searchParams.set("section", nextSectionId);
    }

    nextUrl.hash = childId ?? "";
    window.history.pushState(null, "", nextUrl);
    setSectionId(nextSectionId);

    if (childId) {
      window.setTimeout(() => {
        document.getElementById(childId)?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    } else {
      window.scrollTo({ behavior: "smooth", top: 0 });
    }
  }

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
          onSelectSection={selectSection}
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
