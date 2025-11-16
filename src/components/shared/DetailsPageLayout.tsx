"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import styles from "./DetailsPageLayout.module.css";
import { Button } from "~/foundation/button";
import { MdChevronLeft } from "react-icons/md";

type DetailsPageLayoutProps = {
  title: string;
  children: ReactNode;
  footerAction?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
  };
};

export function DetailsPageLayout(props: DetailsPageLayoutProps) {
  const { title, children, footerAction } = props;
  const router = useRouter();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <MdChevronLeft size={16} />
        </button>
        <h1 className={styles.title}>{title}</h1>
      </header>
      <div className={styles.body}>{children}</div>
      {footerAction && (
        <footer className={styles.footer}>
          <Button onClick={footerAction.onClick} loading={footerAction.loading}>
            {footerAction.label}
          </Button>
        </footer>
      )}
    </div>
  );
}
