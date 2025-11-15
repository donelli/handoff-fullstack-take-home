import { useCallback } from "react";

export function useUserContext() {
  const formatDate = useCallback((date: unknown) => {
    if (!date) return "";
    if (typeof date === "string" || typeof date === "number") {
      return new Date(date).toLocaleString();
    }

    return "-";
  }, []);

  const formatCurrency = useCallback((amount: unknown) => {
    if (typeof amount === "number") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
    }
    return "-";
  }, []);

  return {
    formatDate,
    formatCurrency,
  };
}
