import enBlocks from "../../../content/docs/en/blocks.json";
import ptBrBlocks from "../../../content/docs/pt-BR/blocks.json";
import type { Locale } from "@/shared/i18n/locales";
import type { DocBlock, Section } from "./types";

export const docsContent: Record<
  Locale,
  {
    title: string;
    intro: string;
    sidebarTitle: string;
    versionLabel: string;
    sectionLabels: Record<Section, string>;
    blocks: DocBlock[];
  }
> = {
  en: {
    title: "VPET GO Documentation",
    intro:
      "A bright field manual for the fan-made virtual pet systems, prepared for care rules, version notes, and guide media.",
    sidebarTitle: "Sections",
    versionLabel: "Guide block",
    sectionLabels: {
      CORE_MECHANICS: "Core Mechanics",
      FEEDING: "Care",
      EVOLUTION: "Evolution",
      MINIGAMES: "Minigames",
      CLEANING_HEALTH: "Cleaning and Health",
      UI_INTERFACE: "UI and Interface",
      HARDWARE_CONTROLS: "Hardware Controls"
    },
    blocks: enBlocks as DocBlock[]
  },
  "pt-BR": {
    title: "Documentação do VPET GO",
    intro:
      "Um manual vibrante para os sistemas deste virtual pet feito por fãs, pronto para regras de cuidado, notas de versão e mídias de guia.",
    sidebarTitle: "Seções",
    versionLabel: "Bloco de guia",
    sectionLabels: {
      CORE_MECHANICS: "Mecânicas Principais",
      FEEDING: "Cuidado",
      EVOLUTION: "Evolução",
      MINIGAMES: "Minigames",
      CLEANING_HEALTH: "Limpeza e Saúde",
      UI_INTERFACE: "UI e Interface",
      HARDWARE_CONTROLS: "Controles de Hardware"
    },
    blocks: ptBrBlocks as DocBlock[]
  }
};

export function resolveVersionedText(block: DocBlock, currentVersion: string): string {
  if (block.content[currentVersion]) {
    return block.content[currentVersion];
  }

  const previousVersion = [...block.vpetVersions]
    .reverse()
    .find((version) => version < currentVersion && block.content[version]);

  return previousVersion ? block.content[previousVersion] : block.content.default;
}
