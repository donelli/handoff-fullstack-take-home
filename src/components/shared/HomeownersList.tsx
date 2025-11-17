import { Avatar } from "~/foundation/Avatar";
import { type User } from "~/models/user";
import styles from "./HomeownersList.module.css";

type HomeownersListProps = {
  homeowners: User[];
};

export function HomeownersList({ homeowners }: HomeownersListProps) {
  if (!homeowners || homeowners.length === 0) {
    return null;
  }

  return (
    <div className={styles.list}>
      {homeowners.map((homeowner) => (
        <div key={homeowner.id} className={styles.item}>
          <Avatar size={24}>{homeowner.name.charAt(0).toUpperCase()}</Avatar>
          <span className={styles.name}>{homeowner.name}</span>
        </div>
      ))}
    </div>
  );
}
