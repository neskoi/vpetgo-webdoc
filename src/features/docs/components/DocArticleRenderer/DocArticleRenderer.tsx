import type { ComponentType } from "react";
import { DocArticle } from "../DocArticle";
import { ItemDocArticle } from "../ItemDocArticle";
import type { DocNode } from "../../types";

type DocArticleRendererProps = {
  bodyColor: string;
  content: string[];
  contentId: string;
  children?: DocNode[];
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
  children,
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
        children={children}
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
