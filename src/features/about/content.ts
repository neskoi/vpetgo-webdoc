import type { Locale } from "@/shared/i18n/locales";

export const aboutContent: Record<
  Locale,
  {
    title: string;
    description: string;
    inspiration: string;
    disclaimer: string;
    imageAlt: string;
    imageCaption: string;
  }
> = {
  en: {
    title: "About VPET GO",
    description:
      "VPET GO is a fan-made V-Pet and Tamagotchi-inspired experience focused on portable companionship, care routines, and playful progression.",
    inspiration:
      "It draws inspiration from classic virtual pet devices while standing as its own non-commercial fan work.",
    disclaimer: "Non-profit fan project.",
    imageAlt: "Temporary gameplay image area for VPET GO",
    imageCaption: "Future gameplay and guide artwork will live here."
  },
  "pt-BR": {
    title: "Sobre o VPET GO",
    description:
      "VPET GO é uma experiência feita por fãs inspirada em V-Pets e Tamagotchi, com foco em companhia portátil, rotinas de cuidado e progresso divertido.",
    inspiration:
      "O projeto se inspira em dispositivos clássicos de virtual pet, mas existe como uma obra de fã própria e sem fins comerciais.",
    disclaimer: "Projeto de fã sem fins lucrativos.",
    imageAlt: "Área temporária para imagem de gameplay do VPET GO",
    imageCaption: "Futuras artes de gameplay e guia ficarão aqui."
  }
};
