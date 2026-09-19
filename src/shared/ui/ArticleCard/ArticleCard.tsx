import type { CSSProperties, ReactNode } from "react";
import styles from "./ArticleCard.module.css";

type ArticleCardProps = {
  bodyColor: string;
  children: ReactNode;
  id: string;
  kicker?: string;
  textColor: string;
  title: string;
};

type ArticleCardStyle = CSSProperties & {
  "--article-card-body": string;
  "--article-card-text": string;
};

export function ArticleCard({ bodyColor, children, id, kicker, textColor, title }: ArticleCardProps) {
  const style: ArticleCardStyle = {
    "--article-card-body": bodyColor,
    "--article-card-text": textColor
  };

  return (
    <article className={styles.article} id={id} style={style}>
      <header className={styles.header}>
        {kicker ? <span className={styles.kicker}>{kicker}</span> : null}
        <h2>{title}</h2>
      </header>
      <div className={styles.body}>{children}</div>
    </article>
  );
}
