import styles from "./index.module.css";

type NumberInputProps = {
  placeholder?: string;
  value: number | "";
  onChange: (value: number | "") => void;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  readonly?: boolean;
};

export function NumberInput(props: NumberInputProps) {
  const {
    placeholder = "",
    value,
    onChange,
    min,
    max,
    step,
    required,
    readonly,
  } = props;

  return (
    <div className={styles.textBoxContainer}>
      {props.label && (
        <label className={styles.textBoxLabel}>{props.label}</label>
      )}
      <input
        type="number"
        className={styles.textBox}
        placeholder={placeholder}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === "" ? "" : Number(val));
        }}
        required={required}
        readOnly={readonly}
      />
    </div>
  );
}
