"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/shared/i18n/locales";
import type { DocSection } from "../types";
import styles from "./DocsSidebar.module.css";

type DocsSidebarProps = {
  activeSectionId: string;
  label: string;
  locale: Locale;
  sections: DocSection[];
  title: string;
};

function getStorageKey(locale: Locale): string {
  return `vpetgo.docs.openSections.${locale}`;
}

function readOpenSectionIds(activeSectionId: string, locale: Locale): Set<string> {
  const storedValue = window.localStorage.getItem(getStorageKey(locale));

  if (!storedValue) {
    return new Set([activeSectionId]);
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (Array.isArray(parsedValue) && parsedValue.every((value) => typeof value === "string")) {
      return new Set(parsedValue);
    }
  } catch {
    window.localStorage.removeItem(getStorageKey(locale));
  }

  return new Set([activeSectionId]);
}

function writeOpenSectionIds(locale: Locale, sectionIds: Set<string>) {
  window.localStorage.setItem(getStorageKey(locale), JSON.stringify([...sectionIds]));
}

export function DocsSidebar({ activeSectionId, label, locale, sections, title }: DocsSidebarProps) {
  const [openSectionIds, setOpenSectionIds] = useState<Set<string>>(() => new Set([activeSectionId]));

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setOpenSectionIds(readOpenSectionIds(activeSectionId, locale));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [activeSectionId, locale]);

  function toggleSection(sectionId: string) {
    setOpenSectionIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(sectionId)) {
        nextIds.delete(sectionId);
      } else {
        nextIds.add(sectionId);
      }

      writeOpenSectionIds(locale, nextIds);

      return nextIds;
    });
  }

  return (
    <aside className={styles.sidebar}>
      <h2>{title}</h2>
      <nav aria-label={label}>
        {sections.map((section) => {
          const hasChildren = section.children.length > 0;
          const isOpen = openSectionIds.has(section.id);

          return (
            <div className={styles.navSection} key={section.id}>
              <div className={styles.sectionRow}>
                <Link
                  aria-current={section.id === activeSectionId ? "page" : undefined}
                  className={styles.sectionLink}
                  href={`/${locale}/docs/${section.id}`}
                  scroll={false}
                >
                  {section.title}
                </Link>
                {hasChildren ? (
                  <button
                    aria-expanded={isOpen}
                    aria-label={isOpen ? `Close ${section.title}` : `Open ${section.title}`}
                    className={styles.toggleButton}
                    onClick={() => toggleSection(section.id)}
                    type="button"
                  >
                    <span aria-hidden="true" />
                  </button>
                ) : null}
              </div>
              {hasChildren && isOpen ? (
                <div className={styles.navChildren}>
                  {section.children.map((child) => (
                    <div className={styles.navItem} key={child.id}>
                      <a href={section.id === activeSectionId ? `#${child.id}` : `/${locale}/docs/${section.id}#${child.id}`}>
                        {child.title}
                      </a>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
