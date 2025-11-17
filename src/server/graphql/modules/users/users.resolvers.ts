import type { RequestContext } from "~/server/request_context";
import type { UsersService } from "~/server/service/users/users.service";
import { adaptServiceCall } from "../../resolvers";
import type { AuthService } from "~/server/service/auth/auth.service";

export const buildUsersResolvers = ({
  usersService,
  authService,
}: {
  usersService: UsersService;
  authService: AuthService;
}) => {
  return {
    Query: {
      me: (_: unknown, __: unknown, context: RequestContext) => {
        return adaptServiceCall(() => authService.loadMe(context));
      },
      users: () => {
        return adaptServiceCall(() => usersService.loadAll());
      },
    },
    Mutation: {
      login: (
        _: unknown,
        { input }: { input: { username: string; password: string } },
      ) => {
        return adaptServiceCall(async () => {
          const result = await authService.login(input);
          return { ...result, __typename: "LoginSuccess" };
        });
      },
    },
  };
};
