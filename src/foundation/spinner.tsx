import styles from "./spinner.module.css";

type SpinnerProps = {
  size?: number;
  color?: string;
};

export function Spinner({ size = 16, color }: SpinnerProps) {
  return (
    <div
      className={styles.spinner}
      style={{
        width: size,
        height: size,
        borderColor: color,
        borderTopColor: "transparent",
      }}
    />
  );
}

