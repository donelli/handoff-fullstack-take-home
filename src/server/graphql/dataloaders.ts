import DataLoader from "dataloader";
import type { UsersService } from "../service/users/users.service";
import type { RequestContext } from "../request_context";
import type { User } from "~/models/user";

export type Dependencies = {
  usersService: UsersService;
};

export function buildDataLoaders(dependencies: Dependencies) {
  const { usersService } = dependencies;

  return {
    users: (_context: RequestContext) =>
      new DataLoader<number, User>((ids) => usersService.loadByIds([...ids])),
  };
}

export type DataLoaders = ReturnType<typeof buildDataLoaders>;
