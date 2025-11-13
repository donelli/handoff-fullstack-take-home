
import styles from "./index.module.css";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: HTMLButtonElement["type"];
  variant?: "primary"
};

export function Button(props: ButtonProps) {
  const { type = "button", children, onClick, variant = "primary" } = props;
  const variantClass = variant === "primary" ? styles.buttonPrimary : "";

  return (
    <button onClick={onClick} className={`${styles.button} ${variantClass}`} type={type}>
      {children}
    </button>
  )
}
