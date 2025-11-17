import styles from "./TextBox.module.css";

type TextBoxProps = {
  type?: HTMLInputElement["type"];
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  readonly?: boolean;
};

export function TextBox(props: TextBoxProps) {
  const {
    type = "text",
    placeholder = "",
    value,
    onChange,
    required,
    readonly,
  } = props;

  return (
    <div className={styles.textBoxContainer}>
      {props.label && (
        <label className={styles.textBoxLabel}>
          {props.label}
          {required && <span className={styles.required}> *</span>}
        </label>
      )}
      <input
        type={type}
        className={styles.textBox}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        readOnly={readonly}
      />
    </div>
  );
}
