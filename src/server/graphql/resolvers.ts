import type { MessagesService } from "../service/messages/messages.service";

export type ResolverDependencies = {
  messagesService: MessagesService;
};

export function buildResolvers(dependencies: ResolverDependencies) {
  const { messagesService } = dependencies;

  return {
    Query: {
      hello: () => "Hello World!",
      messages: () => {
        return messagesService.getAllMessages();
      },
    },
    Mutation: {
      addMessage: async (_: unknown, { text }: { text: string }) => {
        return messagesService.addMessage({ text });
      },
    },
  };
}
