export const defaultDocSectionId = "instalacao-vpet-go";

export type DocTextBlock = {
  type: "text";
  content: string;
};

export type DocImageBlock = {
  type: "image";
  alt: string;
  caption?: string;
  height?: number;
  src: string;
  width?: number;
};

export type DocVideoBlock = {
  type: "video";
  src: string;
  title: string;
};

export type DocCustomComponentKey = "Placeholder";

export type DocCustomBlock = {
  type: "custom";
  component: DocCustomComponentKey;
  props?: Record<string, unknown>;
};

export type DocContentBlock = DocTextBlock | DocImageBlock | DocVideoBlock | DocCustomBlock;

export type DocNode = {
  id: string;
  title: string;
  content?: DocContentBlock[];
  children?: DocNode[];
};
