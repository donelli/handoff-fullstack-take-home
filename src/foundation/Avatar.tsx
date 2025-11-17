import styles from "./Avatar.module.css";

type AvatarProps = {
  children: React.ReactNode;
  size?: number;
};

export function Avatar({ children, size = 32 }: AvatarProps) {
  return (
    <div className={styles.avatar} style={{ width: size, height: size }}>
      <span className={styles.initial}>{children}</span>
    </div>
  );
}
