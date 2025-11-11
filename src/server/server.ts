import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { createApolloServer } from "./graphql/server";

export const startGraphqlAndGetNextHandler = () => {
  const server = createApolloServer();

  const handler = startServerAndCreateNextHandler(server, {
    context: async (req) => ({ req }),
  });

  return handler;
};
