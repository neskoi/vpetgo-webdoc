"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { findFirstRenderableDocNode } from "@/shared/content/siteContent";
import type { Locale } from "@/shared/i18n/locales";
import type { DocNode } from "../types";
import styles from "./DocsSidebar.module.css";

type DocsSidebarProps = {
  activeSectionId: string;
  label: string;
  locale: Locale;
  onSelectSection: (sectionId: string, childId?: string) => void;
  sections: DocNode[];
  title: string;
};

type NavNodeStyle = CSSProperties & {
  "--doc-nav-depth": number;
};

function getStorageKey(locale: Locale): string {
  return `vpetgo.docs.openSections.${locale}`;
}

function collectExpandableNodeIds(nodes: DocNode[], openNodeIds = new Set<string>()): Set<string> {
  nodes.forEach((node) => {
    if (node.children?.length) {
      openNodeIds.add(node.id);
      collectExpandableNodeIds(node.children, openNodeIds);
    }
  });

  return openNodeIds;
}

function readOpenSectionIds(locale: Locale, sections: DocNode[]): Set<string> {
  const storedValue = window.localStorage.getItem(getStorageKey(locale));

  if (!storedValue) {
    return collectExpandableNodeIds(sections);
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (Array.isArray(parsedValue) && parsedValue.every((value) => typeof value === "string")) {
      return new Set(parsedValue);
    }
  } catch {
    window.localStorage.removeItem(getStorageKey(locale));
  }

  return collectExpandableNodeIds(sections);
}

function writeOpenSectionIds(locale: Locale, sectionIds: Set<string>) {
  window.localStorage.setItem(getStorageKey(locale), JSON.stringify([...sectionIds]));
}

export function DocsSidebar({ activeSectionId, label, locale, onSelectSection, sections, title }: DocsSidebarProps) {
  const [openSectionIds, setOpenSectionIds] = useState<Set<string>>(() => collectExpandableNodeIds(sections));

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setOpenSectionIds(readOpenSectionIds(locale, sections));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [locale, sections]);

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

  function selectNode(node: DocNode) {
    const renderableNode = findFirstRenderableDocNode(node);

    if (renderableNode) {
      onSelectSection(renderableNode.id);
    }
  }

  function renderNode(node: DocNode, depth: number) {
    const hasChildren = Boolean(node.children?.length);
    const isOpen = openSectionIds.has(node.id);
    const renderableNode = findFirstRenderableDocNode(node);
    const isActive = renderableNode?.id === activeSectionId;
    const style: NavNodeStyle = { "--doc-nav-depth": depth };

    return (
      <div className={styles.navNode} key={node.id} style={style}>
        <div className={styles.nodeRow}>
          <button
            aria-current={isActive ? "page" : undefined}
            className={styles.nodeLink}
            disabled={!renderableNode}
            onClick={() => selectNode(node)}
            type="button"
          >
            {node.title}
          </button>
          {hasChildren ? (
            <button
              aria-expanded={isOpen}
              aria-label={`Toggle ${node.title}`}
              className={styles.toggleButton}
              onClick={() => toggleSection(node.id)}
              type="button"
            >
              <span aria-hidden="true" />
            </button>
          ) : null}
        </div>
        {hasChildren && isOpen ? (
          <div className={styles.navChildren}>
            {node.children?.map((child) => renderNode(child, depth + 1))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <aside className={styles.sidebar}>
      <h2>{title}</h2>
      <nav aria-label={label}>{sections.map((section) => renderNode(section, 0))}</nav>
    </aside>
  );
}
