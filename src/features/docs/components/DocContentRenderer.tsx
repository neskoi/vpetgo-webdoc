import Image from "next/image";
import type { ComponentType } from "react";
import type { DocContentBlock, DocCustomComponentKey, DocTextBlock } from "../types";
import { resolveVersionedText } from "../content";
import styles from "./DocContentRenderer.module.css";

type DocContentRendererProps = {
  blocks: DocContentBlock[];
  currentVersion: string;
};

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

function shouldRenderBlock(block: DocContentBlock, currentVersion: string): boolean {
  if (!block.vpetVersions?.length) {
    return true;
  }

  return block.vpetVersions.some((version) => version <= currentVersion);
}

function renderTextBlock(block: DocTextBlock, currentVersion: string) {
  return <p>{resolveVersionedText(block, currentVersion)}</p>;
}

export function DocContentRenderer({ blocks, currentVersion }: DocContentRendererProps) {
  return (
    <>
      {blocks.filter((block) => shouldRenderBlock(block, currentVersion)).map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === "text") {
          return <div key={key}>{renderTextBlock(block, currentVersion)}</div>;
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
