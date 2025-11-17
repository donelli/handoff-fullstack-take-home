import styles from "./InfoField.module.css";

type InfoFieldProps = {
  label: string;
  value: string | React.ReactNode;
  noBackground?: boolean;
};

export function InfoField(props: InfoFieldProps) {
  const { label, value, noBackground } = props;

  return (
    <div className={`${styles.infoFieldContainer}`}>
      <label className={styles.infoFieldLabel}>{label}</label>
      <div
        className={`${styles.infoFieldValue} ${noBackground ? styles.infoFieldContainerNoBackground : ""}`}
      >
        {value}
      </div>
    </div>
  );
}
