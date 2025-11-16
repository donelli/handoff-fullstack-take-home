"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "~/providers/auth-provider";
import { MainHeader } from "~/foundation/main-header";

export function ConditionalHeader() {
  const { isAuthenticated, ready } = useAuth();
  const pathname = usePathname();

  // Wait for auth to be ready, and only show header when authenticated and not on login page
  if (!ready || !isAuthenticated || pathname === "/login") {
    return null;
  }

  return <MainHeader />;
}

