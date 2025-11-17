import styles from "./TextBox.module.css";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

type DateInputProps = {
  placeholder?: string;
  value: Date | null;
  onChange: (value: Date | null) => void;
  label?: string;
  required?: boolean;
  readonly?: boolean;
  minDate?: Date | null;
  maxDate?: Date | null;
};

export function DateInput(props: DateInputProps) {
  const {
    placeholder = "",
    value,
    onChange,
    required,
    readonly,
    label,
    minDate,
    maxDate,
  } = props;

  return (
    <div className={styles.textBoxContainer}>
      {props.label && <label className={styles.textBoxLabel}>{label}</label>}
      <DatePicker
        className={styles.textBox}
        selected={value}
        onChange={onChange}
        placeholderText={placeholder}
        required={required}
        readOnly={readonly}
        showTimeSelect
        dateFormat="MM/dd/yyyy hh:mm aa"
        timeIntervals={15}
        timeCaption="Time"
        minDate={minDate ?? undefined}
        maxDate={maxDate ?? undefined}
      />
    </div>
  );
}
