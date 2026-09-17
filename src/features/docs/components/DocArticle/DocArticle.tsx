import type { CSSProperties } from "react";
import type { DocContentBlock } from "../../types";
import { DocContentRenderer } from "../DocContentRenderer";
import styles from "./DocArticle.module.css";

type DocArticleProps = {
  bodyColor: string;
  content: DocContentBlock[];
  currentVersion: string;
  id: string;
  textColor: string;
  title: string;
};

type DocArticleStyle = CSSProperties & {
  "--doc-article-body": string;
  "--doc-article-text": string;
};

export function DocArticle({ bodyColor, content, currentVersion, id, textColor, title }: DocArticleProps) {
  const style: DocArticleStyle = {
    "--doc-article-body": bodyColor,
    "--doc-article-text": textColor
  };

  return (
    <article className={styles.article} id={id} style={style}>
      <header className={styles.header}>
        <h2>{title}</h2>
      </header>
      <div className={styles.body}>
        <DocContentRenderer blocks={content} currentVersion={currentVersion} />
      </div>
    </article>
  );
}
