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

export type DocBlock = {
  id: string;
  section: Section;
  title: string;
  vpetVersions: string[];
  content: VersionedText;
  changes?: Record<string, string>;
};
