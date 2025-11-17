import styles from "./Button.module.css";
import { Spinner } from "./Spinner";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: HTMLButtonElement["type"];
  variant?: "primary" | "danger";
  loading?: boolean;
};

export function Button(props: ButtonProps) {
  const {
    type = "button",
    children,
    onClick,
    variant = "primary",
    loading,
  } = props;
  const variantClass =
    variant === "primary"
      ? styles.buttonPrimary
      : variant === "danger"
        ? styles.buttonDanger
        : "";

  return (
    <button
      onClick={onClick}
      className={`${styles.button} ${variantClass}`}
      type={type}
    >
      {children}
      {loading && <Spinner />}
    </button>
  );
}
