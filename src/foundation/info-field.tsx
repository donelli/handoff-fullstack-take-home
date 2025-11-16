import styles from "./index.module.css";

type InfoFieldProps = {
  label: string;
  value: string | React.ReactNode;
};

export function InfoField(props: InfoFieldProps) {
  const { label, value } = props;

  return (
    <div className={styles.infoFieldContainer}>
      <label className={styles.infoFieldLabel}>{label}</label>
      <div className={styles.infoFieldValue}>{value}</div>
    </div>
  );
}
