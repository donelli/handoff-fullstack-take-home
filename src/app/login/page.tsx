"use client";

import React, { useState } from "react";
import styles from "./index.module.css";
import { Button } from "~/foundation/Button";
import { TextBox } from "~/foundation/TextBox";
import { useDoLogin } from "~/hooks/useDoLogin";
import { useRouter } from "next/navigation";
import { useToast } from "~/foundation/hooks/useToast";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { doLogin } = useDoLogin();
  const router = useRouter();
  const { showErrorToast } = useToast();

  const handleSubmit = async () => {
    if (!username || !password) {
      showErrorToast("Username and password are required!");
      return;
    }

    try {
      const result = await doLogin(username, password);

      if (result?.code) {
        switch (result?.code) {
          case "INVALID_USER_OR_EMAIL":
            showErrorToast("Invalid user or password!");
            break;
          default:
            showErrorToast("An unexpected error ocurred!");
        }
        return;
      }

      void router.replace("/");
    } catch (error) {
      console.error(error);
      showErrorToast("An unexpected error ocurred!");
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.form}>
        <h1 className={styles.loginTitle}>Login</h1>

        <TextBox
          value={username}
          onChange={setUsername}
          placeholder="Your user name"
          label="Username"
        />

        <TextBox
          value={password}
          onChange={setPassword}
          type="password"
          placeholder="••••••••"
          label="Password"
        />

        <Button onClick={handleSubmit}>Entrar</Button>
      </div>
    </main>
  );
}
