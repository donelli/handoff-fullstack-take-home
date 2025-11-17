import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { createApolloServer } from "./graphql/server";
import { AuthService } from "./service/auth/auth.service";

export const startGraphqlAndGetNextHandler = () => {
  const server = createApolloServer();

  const handler = startServerAndCreateNextHandler(server, {
    context: async (req) => {
      const userData = AuthService.parseAndValidateToken(req);
      return { req, userData };
    },
  });

  return handler;
};
