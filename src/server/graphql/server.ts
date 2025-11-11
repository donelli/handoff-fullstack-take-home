import { ApolloServer } from "@apollo/server";
import { typeDefs } from "./schema";
import { buildResolvers } from "./resolvers";
import { MessagesService } from "../service/messages/messages.service";
import { db } from "../db";
import { MessagesRepository } from "../repository/messages/messages.repository";

// Create the Apollo Server instance
export function createApolloServer() {
  const messagesRepository = new MessagesRepository(db);
  const messagesService = new MessagesService(messagesRepository);

  return new ApolloServer({
    typeDefs,
    resolvers: buildResolvers({
      messagesService,
    }),
  });
}
