"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/shared/i18n/locales";
import type { DocNavigationItem, DocSection } from "../types";
import styles from "./DocsSidebar.module.css";

type DocsSidebarProps = {
  activeSectionId: string;
  label: string;
  locale: Locale;
  sections: DocNavigationItem[];
  title: string;
};

function getStorageKey(locale: Locale): string {
  return `vpetgo.docs.openSections.${locale}`;
}

function isDocSection(item: DocNavigationItem): item is DocSection {
  return "section" in item;
}

function getDefaultOpenItemIds(activeSectionId: string, sections: DocNavigationItem[]): Set<string> {
  const openItemIds = new Set<string>();

  sections.forEach((item) => {
    if (isDocSection(item)) {
      if (item.id === activeSectionId || item.children.length > 0) {
        openItemIds.add(item.id);
      }

      return;
    }

    openItemIds.add(item.id);

    item.sections.forEach((section) => {
      if (section.id === activeSectionId || section.children.length > 0) {
        openItemIds.add(section.id);
      }
    });
  });

  return openItemIds;
}

function readOpenSectionIds(activeSectionId: string, locale: Locale, sections: DocNavigationItem[]): Set<string> {
  const storedValue = window.localStorage.getItem(getStorageKey(locale));

  if (!storedValue) {
    return getDefaultOpenItemIds(activeSectionId, sections);
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (Array.isArray(parsedValue) && parsedValue.every((value) => typeof value === "string")) {
      return new Set(parsedValue);
    }
  } catch {
    window.localStorage.removeItem(getStorageKey(locale));
  }

  return getDefaultOpenItemIds(activeSectionId, sections);
}

function writeOpenSectionIds(locale: Locale, sectionIds: Set<string>) {
  window.localStorage.setItem(getStorageKey(locale), JSON.stringify([...sectionIds]));
}

export function DocsSidebar({ activeSectionId, label, locale, sections, title }: DocsSidebarProps) {
  const [openSectionIds, setOpenSectionIds] = useState<Set<string>>(() => getDefaultOpenItemIds(activeSectionId, sections));

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setOpenSectionIds(readOpenSectionIds(activeSectionId, locale, sections));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [activeSectionId, locale, sections]);

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

  function renderSection(section: DocSection) {
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
              aria-label={`Toggle ${section.title}`}
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
  }

  return (
    <aside className={styles.sidebar}>
      <h2>{title}</h2>
      <nav aria-label={label}>
        {sections.map((item) => {
          if (isDocSection(item)) {
            return renderSection(item);
          }

          const isOpen = openSectionIds.has(item.id);
          return (
            <div className={styles.navGroup} key={item.id}>
              <div className={styles.groupRow}>
                <button
                  aria-expanded={isOpen}
                  className={styles.groupButton}
                  onClick={() => toggleSection(item.id)}
                  type="button"
                >
                  <span aria-hidden="true" />
                  {item.title}
                </button>
              </div>
              {isOpen ? (
                <div className={styles.groupSections}>
                  {item.sections.map((section) => renderSection(section))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
