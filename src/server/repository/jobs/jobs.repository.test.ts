/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, beforeEach } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { JobsRepository } from "./jobs.repository";
import type { DbClient } from "~/server/db";
import type { Job as PrismaJob } from "generated/prisma";
import { JobStatus } from "~/models/job";

describe("JobsRepository", () => {
  let mockDb: ReturnType<typeof mockDeep<DbClient>>;
  let repository: JobsRepository;

  beforeEach(() => {
    mockDb = mockDeep<DbClient>();
    repository = new JobsRepository(mockDb);
  });

  describe("load", () => {
    it("should return paginated jobs with default filters", async () => {
      const prismaJobs: PrismaJob[] = [
        {
          id: 1,
          description: "Fix roof",
          location: "123 Main St",
          status: "PLANNING",
          cost: 5000,
          createdByUserId: 1,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
          deletedAt: null,
          deletedByUserId: null,
        },
        {
          id: 2,
          description: "Paint walls",
          location: "456 Oak Ave",
          status: "IN_PROGRESS",
          cost: 2000,
          createdByUserId: 1,
          createdAt: new Date("2024-01-02"),
          updatedAt: new Date("2024-01-02"),
          deletedAt: null,
          deletedByUserId: null,
        },
      ];

      mockDb.job.findMany.mockResolvedValue(prismaJobs);
      mockDb.job.count.mockResolvedValue(2);

      const result = await repository.load({
        limit: 10,
        page: 1,
      });

      expect(mockDb.job.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          deletedAt: {
            equals: null,
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });
      expect(mockDb.job.count).toHaveBeenCalledWith({
        where: {
          deletedAt: {
            equals: null,
          },
        },
      });
      expect(result).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            description: "Fix roof",
            location: "123 Main St",
            status: JobStatus.PLANNING,
            cost: 5000,
          }) as unknown,
          expect.objectContaining({
            id: 2,
            description: "Paint walls",
            location: "456 Oak Ave",
            status: JobStatus.IN_PROGRESS,
            cost: 2000,
          }) as unknown,
        ]) as unknown,
      });
    });

    it("should filter by homeownerId", async () => {
      const prismaJobs: PrismaJob[] = [
        {
          id: 1,
          description: "Fix roof",
          location: "123 Main St",
          status: "PLANNING",
          cost: 5000,
          createdByUserId: 1,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
          deletedAt: null,
          deletedByUserId: null,
        },
      ];

      mockDb.job.findMany.mockResolvedValue(prismaJobs);
      mockDb.job.count.mockResolvedValue(1);

      await repository.load({
        limit: 10,
        page: 1,
        homeownerId: 5,
      });

      expect(mockDb.job.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          deletedAt: {
            equals: null,
          },
          homeowners: {
            some: {
              id: {
                equals: 5,
              },
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    });

    it("should filter by createdByUserId", async () => {
      mockDb.job.findMany.mockResolvedValue([]);
      mockDb.job.count.mockResolvedValue(0);

      await repository.load({
        limit: 10,
        page: 1,
        createdByUserId: 3,
      });

      expect(mockDb.job.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          deletedAt: {
            equals: null,
          },
          createdByUserId: {
            equals: 3,
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    });

    it("should filter by status", async () => {
      mockDb.job.findMany.mockResolvedValue([]);
      mockDb.job.count.mockResolvedValue(0);

      await repository.load({
        limit: 10,
        page: 1,
        status: [JobStatus.PLANNING, JobStatus.IN_PROGRESS],
      });

      expect(mockDb.job.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          deletedAt: {
            equals: null,
          },
          status: {
            in: [JobStatus.PLANNING, JobStatus.IN_PROGRESS],
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    });

    it("should handle pagination correctly", async () => {
      mockDb.job.findMany.mockResolvedValue([]);
      mockDb.job.count.mockResolvedValue(50);

      await repository.load({
        limit: 10,
        page: 3,
      });

      expect(mockDb.job.findMany).toHaveBeenCalledWith({
        skip: 20,
        take: 10,
        where: {
          deletedAt: {
            equals: null,
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    });

    it("should return empty array when no jobs match", async () => {
      mockDb.job.findMany.mockResolvedValue([]);
      mockDb.job.count.mockResolvedValue(0);

      const result = await repository.load({
        limit: 10,
        page: 1,
      });

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe("create", () => {
    it("should create a job with all required fields", async () => {
      const prismaJob: PrismaJob = {
        id: 1,
        description: "Fix roof",
        location: "123 Main St",
        status: "PLANNING",
        cost: 5000,
        createdByUserId: 1,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        deletedAt: null,
        deletedByUserId: null,
      };

      mockDb.job.create.mockResolvedValue(prismaJob);

      const result = await repository.create({
        description: "Fix roof",
        location: "123 Main St",
        cost: 5000,
        homeownerIds: [2, 3],
        createdByUserId: 1,
      });

      expect(mockDb.job.create).toHaveBeenCalledWith({
        data: {
          cost: 5000,
          description: "Fix roof",
          location: "123 Main St",
          createdByUserId: 1,
          status: "PLANNING",
          homeowners: {
            connect: [{ id: 2 }, { id: 3 }],
          },
        },
      });
      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          description: "Fix roof",
          location: "123 Main St",
          status: JobStatus.PLANNING,
          cost: 5000,
          createdByUserId: 1,
        }),
      );
    });

    it("should handle empty homeownerIds array", async () => {
      const prismaJob: PrismaJob = {
        id: 1,
        description: "Fix roof",
        location: "123 Main St",
        status: "PLANNING",
        cost: 5000,
        createdByUserId: 1,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        deletedAt: null,
        deletedByUserId: null,
      };

      mockDb.job.create.mockResolvedValue(prismaJob);

      await repository.create({
        description: "Fix roof",
        location: "123 Main St",
        cost: 5000,
        homeownerIds: [],
        createdByUserId: 1,
      });

      expect(mockDb.job.create).toHaveBeenCalledWith({
        data: {
          cost: 5000,
          description: "Fix roof",
          location: "123 Main St",
          createdByUserId: 1,
          status: "PLANNING",
          homeowners: {
            connect: [],
          },
        },
      });
    });
  });

  describe("update", () => {
    it("should update a job with all provided fields", async () => {
      const prismaJob: PrismaJob = {
        id: 1,
        description: "Fix roof updated",
        location: "123 Main St Updated",
        status: "IN_PROGRESS",
        cost: 6000,
        createdByUserId: 1,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
        deletedAt: null,
        deletedByUserId: null,
      };

      mockDb.job.update.mockResolvedValue(prismaJob);

      const result = await repository.update({
        id: 1,
        description: "Fix roof updated",
        location: "123 Main St Updated",
        cost: 6000,
        status: JobStatus.IN_PROGRESS,
        homeownerIds: [2, 4],
      });

      expect(mockDb.job.update).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        data: {
          cost: 6000,
          description: "Fix roof updated",
          location: "123 Main St Updated",
          updatedAt: expect.any(Date) as unknown,
          status: JobStatus.IN_PROGRESS,
          homeowners: {
            set: [{ id: 2 }, { id: 4 }],
          },
        },
      });
      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          description: "Fix roof updated",
          location: "123 Main St Updated",
          status: JobStatus.IN_PROGRESS,
          cost: 6000,
        }),
      );
    });

    it("should update only provided fields", async () => {
      const prismaJob: PrismaJob = {
        id: 1,
        description: "Fix roof",
        location: "123 Main St",
        status: "PLANNING",
        cost: 5000,
        createdByUserId: 1,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
        deletedAt: null,
        deletedByUserId: null,
      };

      mockDb.job.update.mockResolvedValue(prismaJob);

      await repository.update({
        id: 1,
        description: "Fix roof updated",
      });

      expect(mockDb.job.update).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        data: {
          description: "Fix roof updated",
          updatedAt: expect.any(Date) as unknown,
          status: undefined,
          homeowners: undefined,
        },
      });
    });

    it("should not update homeowners when homeownerIds is undefined", async () => {
      const prismaJob: PrismaJob = {
        id: 1,
        description: "Fix roof",
        location: "123 Main St",
        status: "PLANNING",
        cost: 5000,
        createdByUserId: 1,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
        deletedAt: null,
        deletedByUserId: null,
      };

      mockDb.job.update.mockResolvedValue(prismaJob);

      await repository.update({
        id: 1,
        status: JobStatus.COMPLETED,
      });

      const updateCall = mockDb.job.update.mock.calls[0];
      expect(updateCall).toBeDefined();
      expect(updateCall?.[0]?.data).toBeDefined();
      expect(
        (updateCall?.[0]?.data as { homeowners?: unknown }).homeowners,
      ).toBeUndefined();
    });
  });

  describe("loadById", () => {
    it("should return a job when user is the creator", async () => {
      const prismaJob: PrismaJob = {
        id: 1,
        description: "Fix roof",
        location: "123 Main St",
        status: "PLANNING",
        cost: 5000,
        createdByUserId: 1,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        deletedAt: null,
        deletedByUserId: null,
      };

      mockDb.job.findFirst.mockResolvedValue(prismaJob);

      const result = await repository.loadById(1, 1);

      expect(mockDb.job.findFirst).toHaveBeenCalledWith({
        where: {
          id: 1,
          OR: [
            {
              createdByUserId: {
                equals: 1,
              },
            },
            {
              homeowners: {
                some: {
                  id: {
                    equals: 1,
                  },
                },
              },
            },
          ],
        },
      });
      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          description: "Fix roof",
          status: JobStatus.PLANNING,
        }),
      );
    });

    it("should return a job when user is a homeowner", async () => {
      const prismaJob: PrismaJob = {
        id: 1,
        description: "Fix roof",
        location: "123 Main St",
        status: "PLANNING",
        cost: 5000,
        createdByUserId: 2,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        deletedAt: null,
        deletedByUserId: null,
      };

      mockDb.job.findFirst.mockResolvedValue(prismaJob);

      const result = await repository.loadById(1, 5);

      expect(mockDb.job.findFirst).toHaveBeenCalledWith({
        where: {
          id: 1,
          OR: [
            {
              createdByUserId: {
                equals: 5,
              },
            },
            {
              homeowners: {
                some: {
                  id: {
                    equals: 5,
                  },
                },
              },
            },
          ],
        },
      });
      expect(result).toBeDefined();
    });

    it("should return undefined when job is not found", async () => {
      mockDb.job.findFirst.mockResolvedValue(null);

      const result = await repository.loadById(999, 1);

      expect(result).toBeUndefined();
    });

    it("should return undefined when user has no permission", async () => {
      mockDb.job.findFirst.mockResolvedValue(null);

      const result = await repository.loadById(1, 999);

      expect(result).toBeUndefined();
    });
  });

  describe("delete", () => {
    it("should soft delete a job", async () => {
      const prismaJob: PrismaJob = {
        id: 1,
        description: "Fix roof",
        location: "123 Main St",
        status: "PLANNING",
        cost: 5000,
        createdByUserId: 1,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        deletedAt: new Date("2024-01-02"),
        deletedByUserId: 1,
      };

      mockDb.job.update.mockResolvedValue(prismaJob);

      await repository.delete({
        id: 1,
        deletedByUserId: 1,
      });

      expect(mockDb.job.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          deletedAt: expect.any(Date) as unknown,
          deletedByUserId: 1,
        },
      });
    });
  });

  describe("mapJobToDomain", () => {
    it("should map Prisma job to domain job model", () => {
      const prismaJob: PrismaJob = {
        id: 1,
        description: "Fix roof",
        location: "123 Main St",
        status: "PLANNING",
        cost: 5000,
        createdByUserId: 1,
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-01T00:00:00Z"),
        deletedAt: null,
        deletedByUserId: null,
      };

      const result = repository.mapJobToDomain(prismaJob);

      expect(result).toEqual({
        id: 1,
        description: "Fix roof",
        location: "123 Main St",
        status: JobStatus.PLANNING,
        cost: 5000,
        createdByUserId: 1,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        deletedAt: undefined,
        deletedByUserId: null,
      });
    });

    it("should handle deleted job correctly", () => {
      const prismaJob: PrismaJob = {
        id: 1,
        description: "Fix roof",
        location: "123 Main St",
        status: "PLANNING",
        cost: 5000,
        createdByUserId: 1,
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-01T00:00:00Z"),
        deletedAt: new Date("2024-01-02T00:00:00Z"),
        deletedByUserId: 1,
      };

      const result = repository.mapJobToDomain(prismaJob);

      expect(result.deletedAt).toBe("2024-01-02T00:00:00.000Z");
      expect(result.deletedByUserId).toBe(1);
    });
  });

  describe("mapJobStatusToDomain", () => {
    it("should map PLANNING status correctly", () => {
      const result = repository.mapJobStatusToDomain("PLANNING");
      expect(result).toBe(JobStatus.PLANNING);
    });

    it("should map IN_PROGRESS status correctly", () => {
      const result = repository.mapJobStatusToDomain("IN_PROGRESS");
      expect(result).toBe(JobStatus.IN_PROGRESS);
    });

    it("should map COMPLETED status correctly", () => {
      const result = repository.mapJobStatusToDomain("COMPLETED");
      expect(result).toBe(JobStatus.COMPLETED);
    });

    it("should map CANCELED status correctly", () => {
      const result = repository.mapJobStatusToDomain("CANCELED");
      expect(result).toBe(JobStatus.CANCELED);
    });
  });
});
