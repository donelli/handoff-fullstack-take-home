import styles from "./TextBox.module.css";

type TextAreaProps = {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  rows?: number;
  required?: boolean;
  readonly?: boolean;
};

export function TextArea(props: TextAreaProps) {
  const {
    placeholder = "",
    value,
    onChange,
    rows = 4,
    required,
    readonly,
  } = props;

  return (
    <div className={styles.textBoxContainer}>
      {props.label && (
        <label className={styles.textBoxLabel}>{props.label}</label>
      )}
      <textarea
        className={styles.textBox}
        placeholder={placeholder}
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        readOnly={readonly}
      />
    </div>
  );
}

