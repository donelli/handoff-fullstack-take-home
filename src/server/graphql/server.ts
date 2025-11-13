import { ApolloServer } from "@apollo/server";
import { typeDefs } from "./schema";
import { buildResolvers } from "./resolvers";
import { MessagesService } from "../service/messages/messages.service";
import { db } from "../db";
import { MessagesRepository } from "../repository/messages/messages.repository";
import { AuthService } from "../service/auth/auth.service";

export function createApolloServer() {
  const messagesRepository = new MessagesRepository(db);
  const messagesService = new MessagesService(messagesRepository);
  const authService = new AuthService();

  return new ApolloServer({
    typeDefs,
    resolvers: buildResolvers({
      messagesService,
      authService,
    }),
  });
}
