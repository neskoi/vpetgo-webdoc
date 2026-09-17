import type { CSSProperties, ReactNode } from "react";
import styles from "./DocArticle.module.css";

type DocArticleProps = {
  bodyColor: string;
  children: ReactNode;
  id: string;
  textColor: string;
  title: string;
};

type DocArticleStyle = CSSProperties & {
  "--doc-article-body": string;
  "--doc-article-text": string;
};

export function DocArticle({ bodyColor, children, id, textColor, title }: DocArticleProps) {
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
        <p>{children}</p>
      </div>
    </article>
  );
}
