import DataLoader from "dataloader";
import type { UsersService } from "../service/users/users.service";
import type { RequestContext } from "../request_context";
import type { User } from "~/models/user";

export type Dependencies = {
  usersService: UsersService;
};

export function buildDataLoaders(dependencies: Dependencies) {
  const { usersService } = dependencies;
  const loadersCache = new WeakMap<RequestContext, DataLoader<number, User>>();

  return {
    users: (context: RequestContext) => {
      if (!loadersCache.has(context)) {
        loadersCache.set(
          context,
          new DataLoader<number, User>((ids) =>
            usersService.loadByIds([...ids]),
          ),
        );
      }

      return loadersCache.get(context)!;
    },
  };
}

export type DataLoaders = ReturnType<typeof buildDataLoaders>;
