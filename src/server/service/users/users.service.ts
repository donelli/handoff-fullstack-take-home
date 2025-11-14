import type { UsersRepository } from "~/server/repository/users/users.repository";

export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  loadAll() {
    return this.usersRepository.loadAll();
  }

  loadByIds(ids: number[]) {
    return this.usersRepository.loadByIds(ids);
  }
}
