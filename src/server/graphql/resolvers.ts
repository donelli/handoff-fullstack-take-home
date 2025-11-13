import { DomainError } from "../error/domain_error";
import type { AuthService } from "../service/auth/auth.service";
import type { MessagesService } from "../service/messages/messages.service";

export type ResolverDependencies = {
  messagesService: MessagesService;
  authService: AuthService;
};

export function buildResolvers(dependencies: ResolverDependencies) {
  const { messagesService, authService } = dependencies;

  return {
    Query: {
      hello: () => "Hello World!",
      messages: () => {
        return adaptServiceCall(() => messagesService.getAllMessages());
      },
    },
    Mutation: {
      addMessage: async (_: unknown, { text }: { text: string }) => {
        return adaptServiceCall(() => messagesService.addMessage({ text }));
      },
      login: (
        _: unknown,
        { input }: { input: { username: string; password: string } },
      ) => {
        return adaptServiceCall(() => {
          const result = authService.login(input);
          return { ...result, __typename: "LoginSuccess" };
        });
      },
    },
  };
}

function adaptServiceCall<R, C extends () => R>(
  call: C,
): R | { __typename: string; message: string; code: string } {
  try {
    return call();
  } catch (error) {
    if (error instanceof DomainError) {
      return {
        __typename: error.name,
        message: error.message,
        code: error.code,
      };
    }

    throw error;
  }
}
