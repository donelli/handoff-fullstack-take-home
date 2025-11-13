
import styles from "./index.module.css";


type TextBoxProps = {
  type?: HTMLInputElement["type"];
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
};

export function TextBox(props: TextBoxProps) {
  const { type = "text", placeholder = "", value, onChange } = props;

  return (
    <div className={styles.textBoxContainer}>
      {props.label && <label className={styles.textBoxLabel}>{props.label}</label>}
      <input
        type={type}
        className={styles.textBox}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
      />
    </div>
  );
}
