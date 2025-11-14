import type { DbClient } from "~/server/db";
import type { User as PrismaUser } from "generated/prisma";
import { UserType, type User } from "~/models/user";

export class UsersRepository {
  constructor(private readonly db: DbClient) {}

  async loadAll() {
    const allUsers = await this.db.user.findMany();

    return allUsers.map((user) => this.mapToDomainUser(user));
  }

  async loadById(id: number) {
    const user = await this.db.user.findFirst({
      where: {
        id,
      },
    });

    if (!user) {
      return null;
    }

    return this.mapToDomainUser(user);
  }

  async loadByIds(ids: number[]) {
    const allUsers = await this.db.user.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return allUsers.map((user) => this.mapToDomainUser(user));
  }

  mapToDomainUser(prismaUser: PrismaUser): User {
    return {
      name: prismaUser.name,
      id: prismaUser.id,
      type:
        prismaUser.type === "CONTRACTOR"
          ? UserType.CONTRACTOR
          : UserType.HOMEOWNER,
    };
  }
}
