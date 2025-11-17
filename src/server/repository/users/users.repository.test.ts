import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  type MockedFunction,
} from "vitest";
import { UsersRepository } from "./users.repository";
import type { DbClient } from "~/server/db";
import type { User as PrismaUser } from "generated/prisma";
import { UserType } from "~/models/user";

describe("UsersRepository", () => {
  let mockDb: {
    user: {
      findMany: MockedFunction<
        (args?: { where?: { id?: { in: number[] } } }) => Promise<PrismaUser[]>
      >;
      findFirst: MockedFunction<
        (args?: { where?: { id: number } }) => Promise<PrismaUser | null>
      >;
    };
  };
  let repository: UsersRepository;

  beforeEach(() => {
    mockDb = {
      user: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    };
    repository = new UsersRepository(mockDb as unknown as DbClient);
  });

  describe("loadAll", () => {
    it("should return all users mapped to domain users", async () => {
      const prismaUsers: PrismaUser[] = [
        {
          id: 1,
          name: "John Doe",
          username: "johndoe",
          type: "CONTRACTOR",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: "Jane Smith",
          username: "janesmith",
          type: "HOMEOWNER",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDb.user.findMany.mockResolvedValue(prismaUsers);

      const result = await repository.loadAll();

      expect(mockDb.user.findMany).toHaveBeenCalledWith();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        name: "John Doe",
        type: UserType.CONTRACTOR,
      });
      expect(result[1]).toEqual({
        id: 2,
        name: "Jane Smith",
        type: UserType.HOMEOWNER,
      });
    });

    it("should return empty array when no users exist", async () => {
      mockDb.user.findMany.mockResolvedValue([]);

      const result = await repository.loadAll();

      expect(result).toEqual([]);
    });
  });

  describe("loadById", () => {
    it("should return a user when found", async () => {
      const prismaUser: PrismaUser = {
        id: 1,
        name: "John Doe",
        username: "johndoe",
        type: "CONTRACTOR",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.user.findFirst.mockResolvedValue(prismaUser);

      const result = await repository.loadById(1);

      expect(mockDb.user.findFirst).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual({
        id: 1,
        name: "John Doe",
        type: UserType.CONTRACTOR,
      });
    });

    it("should return null when user is not found", async () => {
      mockDb.user.findFirst.mockResolvedValue(null);

      const result = await repository.loadById(999);

      expect(mockDb.user.findFirst).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(result).toBeNull();
    });

    it("should correctly map HOMEOWNER type", async () => {
      const prismaUser: PrismaUser = {
        id: 2,
        name: "Jane Smith",
        username: "janesmith",
        type: "HOMEOWNER",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.user.findFirst.mockResolvedValue(prismaUser);

      const result = await repository.loadById(2);

      expect(result?.type).toBe(UserType.HOMEOWNER);
    });
  });

  describe("loadByIds", () => {
    it("should return users for given ids", async () => {
      const prismaUsers: PrismaUser[] = [
        {
          id: 1,
          name: "John Doe",
          username: "johndoe",
          type: "CONTRACTOR",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: "Jane Smith",
          username: "janesmith",
          type: "HOMEOWNER",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDb.user.findMany.mockResolvedValue(prismaUsers);

      const result = await repository.loadByIds([1, 2]);

      expect(mockDb.user.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: [1, 2],
          },
        },
      });
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe(1);
      expect(result[1]?.id).toBe(2);
    });

    it("should return empty array when no users match the ids", async () => {
      mockDb.user.findMany.mockResolvedValue([]);

      const result = await repository.loadByIds([999, 1000]);

      expect(result).toEqual([]);
    });

    it("should handle empty ids array", async () => {
      mockDb.user.findMany.mockResolvedValue([]);

      const result = await repository.loadByIds([]);

      expect(mockDb.user.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: [],
          },
        },
      });
      expect(result).toEqual([]);
    });
  });

  describe("loadHomeownersByJobId", () => {
    it("should return homeowners associated with a job", async () => {
      const prismaUsers: PrismaUser[] = [
        {
          id: 1,
          name: "Jane Smith",
          username: "janesmith",
          type: "HOMEOWNER",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: "Bob Johnson",
          username: "bobjohnson",
          type: "HOMEOWNER",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDb.user.findMany.mockResolvedValue(prismaUsers);

      const result = await repository.loadHomeownersByJobId(123);

      expect(mockDb.user.findMany).toHaveBeenCalledWith({
        where: {
          jobsAsHomeowner: {
            some: {
              id: 123,
            },
          },
        },
      });
      expect(result).toHaveLength(2);
      expect(result[0]?.type).toBe(UserType.HOMEOWNER);
      expect(result[1]?.type).toBe(UserType.HOMEOWNER);
    });

    it("should return empty array when no homeowners are associated with the job", async () => {
      mockDb.user.findMany.mockResolvedValue([]);

      const result = await repository.loadHomeownersByJobId(999);

      expect(result).toEqual([]);
    });
  });

  describe("mapToDomainUser", () => {
    it("should map CONTRACTOR type correctly", () => {
      const prismaUser: PrismaUser = {
        id: 1,
        name: "John Doe",
        username: "johndoe",
        type: "CONTRACTOR",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = repository.mapToDomainUser(prismaUser);

      expect(result).toEqual({
        id: 1,
        name: "John Doe",
        type: UserType.CONTRACTOR,
      });
    });

    it("should map HOMEOWNER type correctly", () => {
      const prismaUser: PrismaUser = {
        id: 2,
        name: "Jane Smith",
        username: "janesmith",
        type: "HOMEOWNER",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = repository.mapToDomainUser(prismaUser);

      expect(result).toEqual({
        id: 2,
        name: "Jane Smith",
        type: UserType.HOMEOWNER,
      });
    });

    it("should only include id, name, and type in the mapped result", () => {
      const prismaUser: PrismaUser = {
        id: 1,
        name: "John Doe",
        username: "johndoe",
        type: "CONTRACTOR",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = repository.mapToDomainUser(prismaUser);

      expect(result).not.toHaveProperty("username");
      expect(result).not.toHaveProperty("createdAt");
      expect(result).not.toHaveProperty("updatedAt");
      expect(Object.keys(result)).toEqual(["name", "id", "type"]);
    });
  });
});
