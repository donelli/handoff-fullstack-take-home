import styles from "./TextBox.module.css";

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
  prefix?: string;
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
    prefix,
  } = props;

  return (
    <div className={styles.textBoxContainer}>
      {props.label && (
        <label className={styles.textBoxLabel}>{props.label}</label>
      )}
      <div className={styles.textBoxInputContainer}>
        {prefix && <span className={styles.textBoxPrefix}>{prefix}</span>}
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
            if (val === "") {
              onChange("");
            } else {
              const numValue = Number(val);
              // Round to 2 decimal places
              const rounded = Math.round(numValue * 100) / 100;
              onChange(rounded);
            }
          }}
          required={required}
          readOnly={readonly}
        />
      </div>
    </div>
  );
}
