import styles from "./ImagePlaceholder.module.css";

type ImagePlaceholderProps = {
  alt: string;
  caption?: string;
  aspectRatio?: "square" | "wide" | "portrait";
};

export function ImagePlaceholder({
  alt,
  caption,
  aspectRatio = "wide"
}: ImagePlaceholderProps) {
  return (
    <figure className={styles.figure}>
      <div
        aria-label={alt}
        className={styles.placeholder}
        data-aspect-ratio={aspectRatio}
        role="img"
      >
        <span className={styles.pixel} />
      </div>
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  );
}
