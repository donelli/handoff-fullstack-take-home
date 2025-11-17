import styles from "./Tag.module.css";

type TagProps = {
  children: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
};

export function Tag(props: TagProps) {
  const {
    children,
    backgroundColor = "var(--primary-color)",
    textColor = "var(--primary-foreground-color)",
  } = props;
  return (
    <span className={styles.tag} style={{ backgroundColor, color: textColor }}>
      {children}
    </span>
  );
}
