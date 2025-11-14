import type { UsersRepository } from "~/server/repository/users/users.repository";

export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  getAll() {
    return this.usersRepository.getAll();
  }
}
