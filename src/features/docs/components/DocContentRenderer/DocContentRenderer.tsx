import Image from "next/image";
import type { ComponentType } from "react";
import type { DocContentBlock, DocCustomComponentKey } from "../../types";
import styles from "./DocContentRenderer.module.css";

type CustomDocComponentProps = {
  props?: Record<string, unknown>;
};

function PlaceholderCustomBlock({ props }: CustomDocComponentProps) {
  const label = typeof props?.label === "string" ? props.label : "Custom documentation component";

  return <div className={styles.customPlaceholder}>{label}</div>;
}

const customDocComponents: Record<DocCustomComponentKey, ComponentType<CustomDocComponentProps>> = {
  Placeholder: PlaceholderCustomBlock
};

export function DocContentRenderer({ blocks }: { blocks: DocContentBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === "text") {
          return (
            <div key={key}>
              <p>{block.content}</p>
            </div>
          );
        }

        if (block.type === "image") {
          return (
            <figure className={styles.figure} key={key}>
              <Image
                alt={block.alt}
                height={block.height ?? 540}
                src={block.src}
                width={block.width ?? 960}
              />
              {block.caption ? <figcaption>{block.caption}</figcaption> : null}
            </figure>
          );
        }

        if (block.type === "video") {
          return (
            <div className={styles.video} key={key}>
              <iframe allowFullScreen src={block.src} title={block.title} />
            </div>
          );
        }

        const CustomComponent = customDocComponents[block.component];

        return <CustomComponent key={key} props={block.props} />;
      })}
    </>
  );
}
