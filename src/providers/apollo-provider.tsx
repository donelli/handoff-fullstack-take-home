"use client";

import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  HttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { useMemo } from "react";

const TOKEN_KEY = "auth_token";

function createApolloClient() {
  const httpLink = new HttpLink({
    uri: "/api/graphql",
  });

  const authLink = setContext(
    (_, { headers }: { headers?: Record<string, string> }) => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

      return {
        headers: {
          ...(headers ?? {}),
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
      };
    },
  );

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-and-network",
      },
    },
  });
}

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => createApolloClient(), []);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
