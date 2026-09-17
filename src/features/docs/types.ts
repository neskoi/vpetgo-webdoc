export type Section =
  | "CORE_MECHANICS"
  | "FEEDING"
  | "EVOLUTION"
  | "MINIGAMES"
  | "CLEANING_HEALTH"
  | "UI_INTERFACE"
  | "HARDWARE_CONTROLS";

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

export type DocChild = {
  id: string;
  title: string;
  content: DocContentBlock[];
};

export type DocSection = {
  id: string;
  section: Section;
  title: string;
  content: DocContentBlock[];
  children: DocChild[];
};
