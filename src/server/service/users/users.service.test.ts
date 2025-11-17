/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, beforeEach } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { UsersService } from "./users.service";
import type { UsersRepository } from "~/server/repository/users/users.repository";
import type { User } from "~/models/user";
import { UserType } from "~/models/user";

describe("UsersService", () => {
  let mockRepository: ReturnType<typeof mockDeep<UsersRepository>>;
  let service: UsersService;

  beforeEach(() => {
    mockRepository = mockDeep<UsersRepository>();
    service = new UsersService(mockRepository);
  });

  describe("loadAll", () => {
    it("should return all users from repository", async () => {
      const users: User[] = [
        {
          id: 1,
          name: "John Doe",
          type: UserType.CONTRACTOR,
        },
        {
          id: 2,
          name: "Jane Smith",
          type: UserType.HOMEOWNER,
        },
      ];

      mockRepository.loadAll.mockResolvedValue(users);

      const result = await service.loadAll();

      expect(mockRepository.loadAll).toHaveBeenCalledWith();
      expect(result).toEqual(users);
      expect(result).toHaveLength(2);
    });

    it("should return empty array when repository returns empty array", async () => {
      mockRepository.loadAll.mockResolvedValue([]);

      const result = await service.loadAll();

      expect(mockRepository.loadAll).toHaveBeenCalledWith();
      expect(result).toEqual([]);
    });
  });

  describe("loadByIds", () => {
    it("should return users for given ids", async () => {
      const users: User[] = [
        {
          id: 1,
          name: "John Doe",
          type: UserType.CONTRACTOR,
        },
        {
          id: 2,
          name: "Jane Smith",
          type: UserType.HOMEOWNER,
        },
      ];

      mockRepository.loadByIds.mockResolvedValue(users);

      const result = await service.loadByIds([1, 2]);

      expect(mockRepository.loadByIds).toHaveBeenCalledWith([1, 2]);
      expect(result).toEqual(users);
      expect(result).toHaveLength(2);
    });

    it("should return empty array when no users match the ids", async () => {
      mockRepository.loadByIds.mockResolvedValue([]);

      const result = await service.loadByIds([999, 1000]);

      expect(mockRepository.loadByIds).toHaveBeenCalledWith([999, 1000]);
      expect(result).toEqual([]);
    });

    it("should handle empty ids array", async () => {
      mockRepository.loadByIds.mockResolvedValue([]);

      const result = await service.loadByIds([]);

      expect(mockRepository.loadByIds).toHaveBeenCalledWith([]);
      expect(result).toEqual([]);
    });

    it("should handle single id", async () => {
      const user: User = {
        id: 1,
        name: "John Doe",
        type: UserType.CONTRACTOR,
      };

      mockRepository.loadByIds.mockResolvedValue([user]);

      const result = await service.loadByIds([1]);

      expect(mockRepository.loadByIds).toHaveBeenCalledWith([1]);
      expect(result).toEqual([user]);
      expect(result).toHaveLength(1);
    });
  });

  describe("loadHomeownersByJobId", () => {
    it("should return homeowners for given job id", async () => {
      const homeowners: User[] = [
        {
          id: 2,
          name: "Jane Smith",
          type: UserType.HOMEOWNER,
        },
        {
          id: 3,
          name: "Bob Johnson",
          type: UserType.HOMEOWNER,
        },
      ];

      mockRepository.loadHomeownersByJobId.mockResolvedValue(homeowners);

      const result = await service.loadHomeownersByJobId(123);

      expect(mockRepository.loadHomeownersByJobId).toHaveBeenCalledWith(123);
      expect(result).toEqual(homeowners);
      expect(result).toHaveLength(2);
      expect(result[0]?.type).toBe(UserType.HOMEOWNER);
      expect(result[1]?.type).toBe(UserType.HOMEOWNER);
    });

    it("should return empty array when no homeowners are associated with the job", async () => {
      mockRepository.loadHomeownersByJobId.mockResolvedValue([]);

      const result = await service.loadHomeownersByJobId(999);

      expect(mockRepository.loadHomeownersByJobId).toHaveBeenCalledWith(999);
      expect(result).toEqual([]);
    });

    it("should handle single homeowner", async () => {
      const homeowner: User = {
        id: 2,
        name: "Jane Smith",
        type: UserType.HOMEOWNER,
      };

      mockRepository.loadHomeownersByJobId.mockResolvedValue([homeowner]);

      const result = await service.loadHomeownersByJobId(456);

      expect(mockRepository.loadHomeownersByJobId).toHaveBeenCalledWith(456);
      expect(result).toEqual([homeowner]);
      expect(result).toHaveLength(1);
    });
  });
});
