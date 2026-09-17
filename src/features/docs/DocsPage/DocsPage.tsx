"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/shared/ui/Badge";
import { ImagePlaceholder } from "@/shared/ui/ImagePlaceholder";
import { findDocNode, findDocNodePath, getDefaultDocSectionId, getDocSectionIds, getRenderableDocNodesFromSubtree, resolveDocNode, siteContent } from "@/shared/content/siteContent";
import type { Locale } from "@/shared/i18n/locales";
import { DocArticleRenderer } from "../components/DocArticleRenderer";
import { DocsSidebar } from "../components/DocsSidebar";
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
  const activeNode = findDocNode(locale, sectionId);
  const activeNodePath = activeNode ? findDocNodePath(content.sections, activeNode.id) : [];
  const renderableNodes = activeNode ? getRenderableDocNodesFromSubtree(activeNode) : [];

  useEffect(() => {
    function syncSectionFromUrl() {
      setSectionId(readSectionIdFromUrl(validSectionIds, defaultSectionId));
    }

    window.setTimeout(syncSectionFromUrl, 0);
    window.addEventListener("popstate", syncSectionFromUrl);

    return () => window.removeEventListener("popstate", syncSectionFromUrl);
  }, [defaultSectionId, validSectionIds]);

  function selectSection(nextSectionId: string, childId?: string) {
    const nextNode = resolveDocNode(locale, nextSectionId);

    if (!nextNode || !validSectionIds.includes(nextNode.id)) {
      return;
    }

    const nextUrl = new URL(window.location.href);

    if (nextNode.id === defaultSectionId) {
      nextUrl.searchParams.delete("section");
    } else {
      nextUrl.searchParams.set("section", nextNode.id);
    }

    nextUrl.hash = childId ?? "";
    window.history.pushState(null, "", nextUrl);
    setSectionId(nextNode.id);

    if (childId) {
      window.setTimeout(() => {
        document.getElementById(childId)?.scrollIntoView({ behavior: "smooth" });
      }, 0);
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
        />
        <div className={styles.blocks}>
          {activeNode ? (
            <>
              <header className={styles.sectionHeader}>
                <h2>{activeNode.title}</h2>
                <nav aria-label={`${activeNode.title} breadcrumb`} className={styles.breadcrumb}>
                  {activeNodePath.map((node, index) => {
                    const separator = index < activeNodePath.length - 1 ? <span aria-hidden="true">{'>'}</span> : null;

                    if (!node.content?.length) {
                      return (
                        <span className={styles.breadcrumbText} key={node.id}>
                          {node.title}
                          {separator}
                        </span>
                      );
                    }

                    return (
                      <button
                        aria-current={node.id === activeNode.id ? "page" : undefined}
                        className={styles.breadcrumbItem}
                        key={node.id}
                        onClick={() => selectSection(node.id)}
                        type="button"
                      >
                        {node.title}
                        {separator}
                      </button>
                    );
                  })}
                </nav>
              </header>
              {renderableNodes.map((node, index) => (
                <DocArticleRenderer
                  bodyColor={articleColors[index % articleColors.length].bodyColor}
                  content={node.content ?? []}
                  contentId={node.id}
                  currentVersion={currentVersion}
                  htmlId={node.id}
                  key={node.id}
                  textColor={articleColors[index % articleColors.length].textColor}
                  title={node.title}
                />
              ))}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
