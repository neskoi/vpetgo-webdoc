import { ArticleCard } from "@/shared/ui/ArticleCard";
import type { DocNode } from "../../types";
import { DocContentRenderer } from "../DocContentRenderer";
import styles from "./ItemDocArticle.module.css";

type ItemDefinition = {
  docId: string;
  img: string;
};

const items: ItemDefinition[] = [
  { docId: "filling-meat", img: "dotFillingMeat1.png" },
  { docId: "big-protein", img: "dotBigProtein1.png" },
  { docId: "pw-board", img: "dotPWBoard1.png" },
  { docId: "hp-room", img: "dotHPRoom1.png" },
  { docId: "ap-chip", img: "dotAPChip1.png" },
  { docId: "seven-switch", img: "dotSevenSwitch1.png" },
  { docId: "jumper-board", img: "dotJumperBoard1.png" },
  { docId: "exp", img: "dotEXP1.png" }
];

const specialItems: ItemDefinition[] = [
  { docId: "str-max", img: "dotSTR-MAX1.png" },
  { docId: "d-poison", img: "dotD-Poison1.png" },
  { docId: "forest-leaf", img: "dotForestLeaf1.png" },
  { docId: "zombie-meat", img: "dotZombieMeat1.png" },
  { docId: "level-reverse", img: "dotLevelReverse1.png" },
  { docId: "master-tag", img: "dotMasterTag1.png" },
  { docId: "evo-5", img: "dotEvo-5_1.png" },
];

type ItemDocArticleProps = {
  content: string[];
  children?: DocNode[];
  htmlId: string;
  title: string;
};

export function ItemDocArticle({ children = [], content, htmlId, title }: ItemDocArticleProps) {
  const itemDocs = new Map(children.map((child) => [child.id, child]));
  const itemsDescription = itemDocs.get("item-items-description")?.content ?? [];
  const specialDescription = itemDocs.get("item-special-description")?.content ?? [];

  function renderItem(item: ItemDefinition) {
    const itemDoc = itemDocs.get(`item-${item.docId}`);
    const itemTitle = itemDoc?.title ?? item.docId;

    return (
      <article className={styles.itemCard} id={item.docId} key={item.docId}>
        <div className={styles.iconFrame}>
          <img alt={itemTitle} className={styles.icon} height={48} src={`/assets/icons/items/${item.img}`} width={48} />
        </div>
        <div className={styles.itemDetails}>
          <h3>{itemTitle}</h3>
          <p>{itemDoc?.content}</p>
        </div>
      </article>
    );
  }

  return (
    <ArticleCard
      bodyColor="var(--color-sky-dark)"
      id={htmlId}
      textColor="var(--color-white)"
      title={title}
    >
      <DocContentRenderer paragraphs={content} />
      <h2 className={styles.itemSectionTitle}>🍖​ ITEMS</h2>
      <DocContentRenderer paragraphs={itemsDescription} />
      <div className={styles.itemGrid}>{items.map(renderItem)}</div>
      <h2 className={styles.itemSectionTitle}>⭐ SPECIAL</h2>
      <DocContentRenderer paragraphs={specialDescription} />
      <div className={styles.itemGrid}>{specialItems.map(renderItem)}</div>
    </ArticleCard>
  );
}
