import type { ComponentType } from "react";
import type { DocContentBlock } from "../../types";
import { DocArticle } from "../DocArticle";
import { ItemDocArticle } from "../ItemDocArticle";

type DocArticleRendererProps = {
  bodyColor: string;
  content: DocContentBlock[];
  contentId: string;
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
  htmlId,
  textColor,
  title
}: DocArticleRendererProps) {
  const CustomDocArticle = customDocArticles[contentId];

  if (CustomDocArticle) {
    return (
      <CustomDocArticle
        content={content}
        htmlId={htmlId}
        title={title}
      />
    );
  }

  return (
    <DocArticle
      bodyColor={bodyColor}
      content={content}
      id={htmlId}
      textColor={textColor}
      title={title}
    />
  );
}
