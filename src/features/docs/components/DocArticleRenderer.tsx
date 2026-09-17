import type { ComponentType } from "react";
import type { DocContentBlock } from "../types";
import { DocArticle } from "./DocArticle";
import { ItemDocArticle } from "./ItemDocArticle";

type DocArticleRendererProps = {
  bodyColor: string;
  content: DocContentBlock[];
  contentId: string;
  currentVersion: string;
  htmlId: string;
  textColor: string;
  title: string;
};

type CustomDocArticleProps = Omit<DocArticleRendererProps, "bodyColor" | "contentId" | "textColor">;

const customDocArticles: Record<string, ComponentType<CustomDocArticleProps>> = {
  item: ItemDocArticle
};

export function DocArticleRenderer({
  bodyColor,
  content,
  contentId,
  currentVersion,
  htmlId,
  textColor,
  title
}: DocArticleRendererProps) {
  const CustomDocArticle = customDocArticles[contentId];

  if (CustomDocArticle) {
    return (
      <CustomDocArticle
        content={content}
        currentVersion={currentVersion}
        htmlId={htmlId}
        title={title}
      />
    );
  }

  return (
    <DocArticle
      bodyColor={bodyColor}
      content={content}
      currentVersion={currentVersion}
      id={htmlId}
      textColor={textColor}
      title={title}
    />
  );
}
