import { ArticleCard } from "@/shared/ui/ArticleCard";
import { DocContentRenderer } from "../DocContentRenderer";
import styles from "./ItemDocArticle.module.css";

const itemFiles = [
  "dotAPChip1.png", "dotBigProtein1.png", "dotD-Poison1.png", "dotEXP1.png",
  "dotEvo-5_1.png", "dotFillingMeat1.png", "dotForestLeaf1.png", "dotGif1.png",
  "dotHPRoom1.png", "dotJumperBoard1.png", "dotLevelReverse1.png", "dotMasterTag1.png",
  "dotPWBoard1.png", "dotSTR-MAX1.png", "dotSevenSwitch1.png", "dotZombieMeat1.png"
] as const;

function getItemName(fileName: string): string {
  return fileName.replace(/^dot/, "").replace(/1\.png$/, "").replace(/[-_]/g, " ");
}

type ItemDocArticleProps = {
  content: string[];
  htmlId: string;
  title: string;
};

export function ItemDocArticle({ content, htmlId, title }: ItemDocArticleProps) {
  return (
    <ArticleCard
      bodyColor="var(--color-pink)"
      id={htmlId}
      textColor="var(--color-white)"
      title={title}
    >
        <DocContentRenderer paragraphs={content} />
        <div className={styles.itemGrid}>
          {itemFiles.map((fileName) => (
            <article className={styles.itemCard} key={fileName}>
              <div className={styles.iconFrame}>
                <img alt={getItemName(fileName)} className={styles.icon} height={48} src={`/assets/icons/items/${fileName}`} width={48} />
              </div>
              <div className={styles.itemDetails}>
                <h3>{getItemName(fileName)}</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              </div>
            </article>
          ))}
        </div>
    </ArticleCard>
  );
}
