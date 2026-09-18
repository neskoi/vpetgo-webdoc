import type { DocContentBlock } from "../../types";
import { DocContentRenderer } from "../DocContentRenderer";
import styles from "./ItemDocArticle.module.css";

type ItemDocArticleProps = {
  content: DocContentBlock[];
  htmlId: string;
  title: string;
};

export function ItemDocArticle({ content, htmlId, title }: ItemDocArticleProps) {
  return (
    <article className={styles.article} id={htmlId}>
      <header className={styles.header}>
        <span className={styles.kicker}>Custom component test</span>
        <h2>{title}</h2>
      </header>
      <div className={styles.body}>
        <DocContentRenderer blocks={content} />
      </div>
    </article>
  );
}
