import { ArticleCard } from "@/shared/ui/ArticleCard";
import { DocContentRenderer } from "../DocContentRenderer";

type DocArticleProps = {
  bodyColor: string;
  content: string[];
  id: string;
  textColor: string;
  title: string;
};

export function DocArticle({ bodyColor, content, id, textColor, title }: DocArticleProps) {
  return (
    <ArticleCard bodyColor={bodyColor} id={id} textColor={textColor} title={title}>
        <DocContentRenderer paragraphs={content} />
    </ArticleCard>
  );
}
