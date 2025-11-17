import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  type MockedFunction,
} from "vitest";
import { JobChatMessageRepository } from "./job_chat_message.repository";
import type { DbClient } from "~/server/db";
import type { JobChatMessage as PrismaJobChatMessage } from "generated/prisma";

describe("JobChatMessageRepository", () => {
  let mockDb: {
    jobChatMessage: {
      create: MockedFunction<
        (args: { data: unknown }) => Promise<PrismaJobChatMessage>
      >;
      findMany: MockedFunction<
        (args?: { where?: { jobId: number } }) => Promise<PrismaJobChatMessage[]>
      >;
    };
  };
  let repository: JobChatMessageRepository;

  beforeEach(() => {
    mockDb = {
      jobChatMessage: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
    };
    repository = new JobChatMessageRepository(mockDb as unknown as DbClient);
  });

  describe("create", () => {
    it("should create a job chat message with all required fields", async () => {
      const prismaMessage: PrismaJobChatMessage = {
        id: 1,
        content: "Hello, when can we start?",
        jobId: 123,
        createdByUserId: 1,
        createdAt: new Date("2024-01-01T00:00:00Z"),
      };

      mockDb.jobChatMessage.create.mockResolvedValue(prismaMessage);

      const result = await repository.create({
        content: "Hello, when can we start?",
        jobId: 123,
        createdByUserId: 1,
      });

      expect(mockDb.jobChatMessage.create).toHaveBeenCalledWith({
        data: {
          content: "Hello, when can we start?",
          jobId: 123,
          createdByUserId: 1,
        },
      });
      expect(result).toEqual(prismaMessage);
    });

    it("should handle different message content", async () => {
      const prismaMessage: PrismaJobChatMessage = {
        id: 2,
        content: "The job is completed!",
        jobId: 456,
        createdByUserId: 2,
        createdAt: new Date("2024-01-02T00:00:00Z"),
      };

      mockDb.jobChatMessage.create.mockResolvedValue(prismaMessage);

      const result = await repository.create({
        content: "The job is completed!",
        jobId: 456,
        createdByUserId: 2,
      });

      expect(mockDb.jobChatMessage.create).toHaveBeenCalledWith({
        data: {
          content: "The job is completed!",
          jobId: 456,
          createdByUserId: 2,
        },
      });
      expect(result).toEqual(prismaMessage);
    });
  });

  describe("loadAllByJobId", () => {
    it("should return all messages for a job", async () => {
      const prismaMessages: PrismaJobChatMessage[] = [
        {
          id: 1,
          content: "Hello, when can we start?",
          jobId: 123,
          createdByUserId: 1,
          createdAt: new Date("2024-01-01T00:00:00Z"),
        },
        {
          id: 2,
          content: "We can start next Monday",
          jobId: 123,
          createdByUserId: 2,
          createdAt: new Date("2024-01-01T01:00:00Z"),
        },
        {
          id: 3,
          content: "Perfect, see you then!",
          jobId: 123,
          createdByUserId: 1,
          createdAt: new Date("2024-01-01T02:00:00Z"),
        },
      ];

      mockDb.jobChatMessage.findMany.mockResolvedValue(prismaMessages);

      const result = await repository.loadAllByJobId(123);

      expect(mockDb.jobChatMessage.findMany).toHaveBeenCalledWith({
        where: {
          jobId: 123,
        },
      });
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        id: 1,
        content: "Hello, when can we start?",
        jobId: 123,
        createdByUserId: 1,
        createdAt: "2024-01-01T00:00:00.000Z",
      });
      expect(result[1]).toEqual({
        id: 2,
        content: "We can start next Monday",
        jobId: 123,
        createdByUserId: 2,
        createdAt: "2024-01-01T01:00:00.000Z",
      });
      expect(result[2]).toEqual({
        id: 3,
        content: "Perfect, see you then!",
        jobId: 123,
        createdByUserId: 1,
        createdAt: "2024-01-01T02:00:00.000Z",
      });
    });

    it("should return empty array when no messages exist for the job", async () => {
      mockDb.jobChatMessage.findMany.mockResolvedValue([]);

      const result = await repository.loadAllByJobId(999);

      expect(mockDb.jobChatMessage.findMany).toHaveBeenCalledWith({
        where: {
          jobId: 999,
        },
      });
      expect(result).toEqual([]);
    });

    it("should return messages for different job IDs", async () => {
      const prismaMessages: PrismaJobChatMessage[] = [
        {
          id: 4,
          content: "Different job message",
          jobId: 456,
          createdByUserId: 3,
          createdAt: new Date("2024-01-02T00:00:00Z"),
        },
      ];

      mockDb.jobChatMessage.findMany.mockResolvedValue(prismaMessages);

      const result = await repository.loadAllByJobId(456);

      expect(mockDb.jobChatMessage.findMany).toHaveBeenCalledWith({
        where: {
          jobId: 456,
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.jobId).toBe(456);
    });
  });

  describe("mapToDomainJobChatMessage", () => {
    it("should map Prisma job chat message to domain model", () => {
      const prismaMessage: PrismaJobChatMessage = {
        id: 1,
        content: "Hello, when can we start?",
        jobId: 123,
        createdByUserId: 1,
        createdAt: new Date("2024-01-01T00:00:00Z"),
      };

      const result = repository.mapToDomainJobChatMessage(prismaMessage);

      expect(result).toEqual({
        id: 1,
        content: "Hello, when can we start?",
        jobId: 123,
        createdByUserId: 1,
        createdAt: "2024-01-01T00:00:00.000Z",
      });
    });

    it("should only include id, content, jobId, createdByUserId, and createdAt in the mapped result", () => {
      const prismaMessage: PrismaJobChatMessage = {
        id: 1,
        content: "Test message",
        jobId: 123,
        createdByUserId: 1,
        createdAt: new Date("2024-01-01T00:00:00Z"),
      };

      const result = repository.mapToDomainJobChatMessage(prismaMessage);

      expect(Object.keys(result)).toEqual([
        "id",
        "content",
        "jobId",
        "createdByUserId",
        "createdAt",
      ]);
    });

    it("should handle different date formats correctly", () => {
      const prismaMessage: PrismaJobChatMessage = {
        id: 2,
        content: "Another message",
        jobId: 456,
        createdByUserId: 2,
        createdAt: new Date("2024-12-25T15:30:45Z"),
      };

      const result = repository.mapToDomainJobChatMessage(prismaMessage);

      expect(result.createdAt).toBe("2024-12-25T15:30:45.000Z");
    });
  });
});

