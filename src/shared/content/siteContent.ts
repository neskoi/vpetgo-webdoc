import enContent from "../../../content/en.json";
import enDocsSections from "../../../content/docs/en/sections.json";
import ptBrContent from "../../../content/pt-BR.json";
import ptBrDocsSections from "../../../content/docs/pt-BR/sections.json";
import type { Locale } from "@/shared/i18n/locales";
import type { DocNavigationItem, DocSection, DocTextBlock } from "@/features/docs/types";

export const siteContent: Record<
  Locale,
  typeof enContent & {
    docs: typeof enContent.docs & {
      sections: DocNavigationItem[];
    };
  }
> = {
  en: {
    ...enContent,
    docs: {
      ...enContent.docs,
      sections: enDocsSections as DocNavigationItem[]
    }
  },
  "pt-BR": {
    ...ptBrContent,
    docs: {
      ...ptBrContent.docs,
      sections: ptBrDocsSections as DocNavigationItem[]
    }
  }
};

export function isDocSection(item: DocNavigationItem): item is DocSection {
  return "section" in item;
}

export function getDocSections(locale: Locale): DocSection[] {
  return siteContent[locale].docs.sections.flatMap((item) => (isDocSection(item) ? [item] : item.sections));
}

export function getDefaultDocSectionId(locale: Locale): string {
  return getDocSections(locale)[0].id;
}

export function findDocSection(locale: Locale, sectionId: string): DocSection | undefined {
  return getDocSections(locale).find((section) => section.id === sectionId);
}

export function getDocSectionIds(locale: Locale): string[] {
  return getDocSections(locale).map((section) => section.id);
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
