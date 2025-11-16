import styles from "./index.module.css";
import { Spinner } from "./spinner";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: HTMLButtonElement["type"];
  variant?: "primary";
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
  const variantClass = variant === "primary" ? styles.buttonPrimary : "";

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
