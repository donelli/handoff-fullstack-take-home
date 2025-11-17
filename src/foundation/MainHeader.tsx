"use client";

import Link from "next/link";
import { useAuth } from "~/providers/auth-provider";
import { Avatar } from "./Avatar";
import styles from "./MainHeader.module.css";
import { MdLogout } from "react-icons/md";

export function MainHeader() {
  const { user, logout } = useAuth();
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : null;

  const handleLogout = () => {
    logout();
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link href="/">
          <h1 className={styles.title}>Handoff Take Home</h1>
        </Link>
      </div>
      <div className={styles.right}>
        {userInitial && <Avatar>{userInitial}</Avatar>}
        <span className={styles.userName}>{user?.name}</span>
        <span
          className={styles.logoutButton}
          onClick={handleLogout}
          title="Logout"
        >
          <MdLogout size={16} />
        </span>
      </div>
    </header>
  );
}
