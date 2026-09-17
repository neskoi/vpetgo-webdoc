import styles from "./Badge.module.css";

type BadgeProps = {
  children: React.ReactNode;
};

export function Badge({ children }: BadgeProps) {
  return <span className={styles.badge}>{children}</span>;
}
