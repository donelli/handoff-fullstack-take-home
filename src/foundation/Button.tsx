import styles from "./Button.module.css";
import { Spinner } from "./Spinner";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: HTMLButtonElement["type"];
  variant?: "primary" | "danger" | "outline";
  size?: "small" | "medium";
  loading?: boolean;
  disabled?: boolean;
};

export function Button(props: ButtonProps) {
  const {
    type = "button",
    children,
    onClick,
    variant = "primary",
    size = "medium",
    loading,
    disabled,
  } = props;
  const variantClass =
    variant === "primary"
      ? styles.buttonPrimary
      : variant === "danger"
        ? styles.buttonDanger
        : variant === "outline"
          ? styles.buttonOutline
          : "";
  const sizeClass = size === "small" ? styles.buttonSmall : styles.buttonMedium;

  return (
    <button
      onClick={onClick}
      className={`${styles.button} ${variantClass} ${sizeClass}`}
      type={type}
      disabled={!!disabled || !!loading}
    >
      {children}
      {loading && <Spinner />}
    </button>
  );
}
