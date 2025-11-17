"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "~/models/user";

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  ready: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = "auth_user";
const TOKEN_KEY = "auth_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  const loadUserFromStorage = async () => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      const token = localStorage.getItem(TOKEN_KEY);
      if (raw) {
        setUser(JSON.parse(raw) as User);
      }
      if (token) {
        setToken(token);
      }
    } catch (e) {
      console.error("AuthProvider: failed to load user from storage", e);
    } finally {
      setReady(true);
    }
  };

  useEffect(() => {
    void loadUserFromStorage();
  }, []);

  const login = async (token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setUser(user);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setToken(null);

    void router.replace("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user && !!token,
        ready,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, ready } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated && pathname !== "/login") {
      router.replace("/login");
    }
  }, [isAuthenticated, ready, pathname, router]);

  if (!ready) return null;
  return <>{children}</>;
}

export default AuthProvider;
