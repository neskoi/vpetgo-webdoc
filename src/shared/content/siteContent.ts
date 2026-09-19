import enContent from "../../../content/en.json";
import enDocsSections from "../../../content/docs/en/sections.json";
import ptBrContent from "../../../content/pt-BR.json";
import ptBrDocsSections from "../../../content/docs/pt-BR/sections.json";
import type { Locale } from "@/shared/i18n/locales";
import { defaultDocSectionId, type DocNode } from "@/features/docs/types";

export const siteContent: Record<
  Locale,
  typeof enContent & {
    docs: typeof enContent.docs & {
      sections: DocNode[];
    };
  }
> = {
  en: {
    ...enContent,
    docs: {
      ...enContent.docs,
      sections: enDocsSections as DocNode[]
    }
  },
  "pt-BR": {
    ...ptBrContent,
    docs: {
      ...ptBrContent.docs,
      sections: ptBrDocsSections as DocNode[]
    }
  }
};

const customDocNodeIds = new Set(["item"]);

export function hasDocContent(node: DocNode): boolean {
  return Boolean(node.content?.length);
}

export function flattenDocNodes(nodes: DocNode[]): DocNode[] {
  return nodes.flatMap((node) => [node, ...flattenDocNodes(node.children ?? [])]);
}

export function findFirstRenderableDocNode(node: DocNode): DocNode | undefined {
  if (hasDocContent(node)) {
    return node;
  }

  for (const child of node.children ?? []) {
    const renderableNode = findFirstRenderableDocNode(child);

    if (renderableNode) {
      return renderableNode;
    }
  }

  return undefined;
}

export function getRenderableDocNodesFromSubtree(node: DocNode): DocNode[] {
  if (customDocNodeIds.has(node.id)) {
    return hasDocContent(node) ? [node] : [];
  }

  return [
    ...(hasDocContent(node) ? [node] : []),
    ...(node.children ?? []).flatMap((child) => getRenderableDocNodesFromSubtree(child))
  ];
}

export function getDocNodes(locale: Locale): DocNode[] {
  return siteContent[locale].docs.sections;
}

export function getRenderableDocNodes(locale: Locale): DocNode[] {
  return flattenDocNodes(getDocNodes(locale)).filter(hasDocContent);
}

export function findDocNodePath(nodes: DocNode[], nodeId: string): DocNode[] {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return [node];
    }

    const childPath = findDocNodePath(node.children ?? [], nodeId);

    if (childPath.length) {
      return [node, ...childPath];
    }
  }

  return [];
}

export function findDocNode(locale: Locale, nodeId: string): DocNode | undefined {
  return flattenDocNodes(getDocNodes(locale)).find((node) => node.id === nodeId);
}

export function resolveDocNode(locale: Locale, nodeId: string): DocNode | undefined {
  const node = findDocNode(locale, nodeId);

  if (!node) {
    return undefined;
  }

  const nodePath = findDocNodePath(getDocNodes(locale), nodeId);
  const customParent = nodePath.find((pathNode) => customDocNodeIds.has(pathNode.id));

  return customParent ?? findFirstRenderableDocNode(node);
}

export function getDefaultDocSectionId(locale: Locale): string {
  return resolveDocNode(locale, defaultDocSectionId)?.id ?? getRenderableDocNodes(locale)[0]?.id ?? defaultDocSectionId;
}

export function getDocSectionIds(locale: Locale): string[] {
  return getRenderableDocNodes(locale).map((node) => node.id);
}
