import React from "react";
import styles from "./StatusToggle.module.css";
import { Spinner } from "./spinner";

type StatusToggleProps<T extends string> = {
  value: T;
  options: {
    label: string;
    value: T;
    icon: (color: string) => React.ReactNode;
    color: string;
    selectedBackgroundColor: string;
  }[];
  onChange: (value: T) => void;
  loading: boolean;
};

export function StatusToggle<T extends string>(props: StatusToggleProps<T>) {
  const { value, options, onChange, loading } = props;

  const handleChange = (newValue: T) => {
    if (loading || newValue === value) return;

    onChange(newValue);
  };

  const activeOption = options.find((option) => option.value === value);
  const activeStyle = {
    borderColor: activeOption?.color,
    backgroundColor: activeOption?.selectedBackgroundColor,
  };

  return (
    <div className={styles.statusToggleContainer}>
      {options.map((option) => (
        <button
          key={option.value}
          className={`${styles.statusToggleButton} ${value === option.value ? styles.statusToggleButtonActive : styles.statusToggleButtonSelectable}`}
          style={value === option.value ? activeStyle : undefined}
          onClick={() => handleChange(option.value)}
        >
          {option.icon(option?.color || "")}
          <span
            style={value === option.value ? { color: option.color } : undefined}
          >
            {option.label}
          </span>
        </button>
      ))}
      {loading && (
        <div className={styles.statusToggleLoading}>
          <Spinner />
        </div>
      )}
    </div>
  );
}
