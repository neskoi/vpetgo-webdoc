import type { Locale } from "@/shared/i18n/locales";

export const shellContent: Record<
  Locale,
  {
    navigation: {
      docs: string;
      about: string;
    };
    footer: {
      disclaimer: string;
      status: string;
    };
    localeSwitcherLabel: string;
    primaryNavigationLabel: string;
  }
> = {
  en: {
    navigation: {
      docs: "Docs",
      about: "About"
    },
    footer: {
      disclaimer: "Non-profit fan project.",
      status: "VPET GO documentation"
    },
    localeSwitcherLabel: "Language",
    primaryNavigationLabel: "Primary navigation"
  },
  "pt-BR": {
    navigation: {
      docs: "Docs",
      about: "Sobre"
    },
    footer: {
      disclaimer: "Projeto de fã sem fins lucrativos.",
      status: "Documentação do VPET GO"
    },
    localeSwitcherLabel: "Idioma",
    primaryNavigationLabel: "Navegação principal"
  }
};
