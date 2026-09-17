import enBlocks from "../../../content/docs/en/blocks.json";
import ptBrBlocks from "../../../content/docs/pt-BR/blocks.json";
import type { Locale } from "@/shared/i18n/locales";
import type { DocSection, DocTextBlock } from "./types";

export const docsContent: Record<
  Locale,
  {
    title: string;
    intro: string;
    sidebarTitle: string;
    versionLabel: string;
    sections: DocSection[];
  }
> = {
  en: {
    title: "VPET GO Documentation",
    intro:
      "A bright field manual for the fan-made virtual pet systems, prepared for care rules, version notes, and guide media.",
    sidebarTitle: "Sections",
    versionLabel: "Guide block",
    sections: enBlocks as DocSection[]
  },
  "pt-BR": {
    title: "Documentação do VPET GO",
    intro:
      "Um manual vibrante para os sistemas deste virtual pet feito por fãs, pronto para regras de cuidado, notas de versão e mídias de guia.",
    sidebarTitle: "Seções",
    versionLabel: "Bloco de guia",
    sections: ptBrBlocks as DocSection[]
  }
};

export function getDefaultDocSectionId(locale: Locale): string {
  return docsContent[locale].sections[0].id;
}

export function findDocSection(locale: Locale, sectionId: string): DocSection | undefined {
  return docsContent[locale].sections.find((section) => section.id === sectionId);
}

export function getDocSectionIds(locale: Locale): string[] {
  return docsContent[locale].sections.map((section) => section.id);
}

export function resolveVersionedText(block: DocTextBlock, currentVersion: string): string {
  if (block.content[currentVersion]) {
    return block.content[currentVersion];
  }

  const previousVersion = [...(block.vpetVersions ?? [])]
    .reverse()
    .find((version) => version < currentVersion && block.content[version]);

  return previousVersion ? block.content[previousVersion] : block.content.default;
}
