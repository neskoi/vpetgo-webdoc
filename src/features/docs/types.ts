export const defaultDocSectionId = "instalacao-vpet-go";

export type VersionedText = {
  default: string;
  [version: string]: string;
};

type VersionedContent = {
  vpetVersions?: string[];
  changes?: Record<string, string>;
};

export type DocTextBlock = VersionedContent & {
  type: "text";
  content: VersionedText;
};

export type DocImageBlock = VersionedContent & {
  type: "image";
  alt: string;
  caption?: string;
  height?: number;
  src: string;
  width?: number;
};

export type DocVideoBlock = VersionedContent & {
  type: "video";
  src: string;
  title: string;
};

export type DocCustomComponentKey = "Placeholder";

export type DocCustomBlock = VersionedContent & {
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
