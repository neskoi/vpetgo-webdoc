import enContent from "../../../content/en.json";
import enDocsSections from "../../../content/docs/en/sections.json";
import ptBrContent from "../../../content/pt-BR.json";
import ptBrDocsSections from "../../../content/docs/pt-BR/sections.json";
import type { Locale } from "@/shared/i18n/locales";
import type { DocSection, DocTextBlock } from "@/features/docs/types";

export const siteContent: Record<
  Locale,
  typeof enContent & {
    docs: typeof enContent.docs & {
      sections: DocSection[];
    };
  }
> = {
  en: {
    ...enContent,
    docs: {
      ...enContent.docs,
      sections: enDocsSections as DocSection[]
    }
  },
  "pt-BR": {
    ...ptBrContent,
    docs: {
      ...ptBrContent.docs,
      sections: ptBrDocsSections as DocSection[]
    }
  }
};

export function getDefaultDocSectionId(locale: Locale): string {
  return siteContent[locale].docs.sections[0].id;
}

export function findDocSection(locale: Locale, sectionId: string): DocSection | undefined {
  return siteContent[locale].docs.sections.find((section) => section.id === sectionId);
}

export function getDocSectionIds(locale: Locale): string[] {
  return siteContent[locale].docs.sections.map((section) => section.id);
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
