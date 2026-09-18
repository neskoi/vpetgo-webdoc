export const defaultDocSectionId = "instalacao-vpet-go";

export type DocNode = {
  id: string;
  title: string;
  content?: string[];
  children?: DocNode[];
};
