/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, beforeEach } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { JobChatMessageService } from "./job_chat_message.service";
import type { JobChatMessageRepository } from "~/server/repository/job_chat_message/job_chat_message.repository";
import type { JobsRepository } from "~/server/repository/jobs/jobs.repository";
import type { RequestContext } from "~/server/request_context";
import { ProtectedRouteError } from "~/server/error/protected_route_error";
import type { JobChatMessage as PrismaJobChatMessage } from "generated/prisma";
import type { JobModel } from "~/models/job";
import { JobStatus } from "~/models/job";
import { UserType } from "~/models/user";

describe("JobChatMessageService", () => {
  let mockJobChatMessageRepository: ReturnType<
    typeof mockDeep<JobChatMessageRepository>
  >;
  let mockJobsRepository: ReturnType<typeof mockDeep<JobsRepository>>;
  let service: JobChatMessageService;
  let mockContext: RequestContext;

  beforeEach(() => {
    mockJobChatMessageRepository = mockDeep<JobChatMessageRepository>();
    mockJobsRepository = mockDeep<JobsRepository>();
    service = new JobChatMessageService(
      mockJobChatMessageRepository,
      mockJobsRepository,
    );
    mockContext = {
      req: {} as Request,
      userData: {
        id: 1,
        type: UserType.CONTRACTOR,
      },
    };
  });

  describe("create", () => {
    it("should create a job chat message when user is authenticated and job exists", async () => {
      const job: JobModel = {
        id: 123,
        description: "Fix roof",
        location: "123 Main St",
        cost: 5000,
        status: JobStatus.PLANNING,
        createdByUserId: 1,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      const prismaMessage: PrismaJobChatMessage = {
        id: 1,
        content: "Hello, when can we start?",
        jobId: 123,
        createdByUserId: 1,
        createdAt: new Date("2024-01-01T00:00:00Z"),
      };

      mockJobsRepository.loadById.mockResolvedValue(job);
      mockJobChatMessageRepository.create.mockResolvedValue(prismaMessage);

      const result = await service.create({
        content: "Hello, when can we start?",
        jobId: 123,
        context: mockContext,
      });

      expect(mockJobsRepository.loadById).toHaveBeenCalledWith(123, 1);
      expect(mockJobChatMessageRepository.create).toHaveBeenCalledWith({
        content: "Hello, when can we start?",
        jobId: 123,
        createdByUserId: 1,
      });
      expect(result).toEqual({ data: prismaMessage });
    });

    it("should throw ProtectedRouteError when user is not authenticated", async () => {
      const contextWithoutUser: RequestContext = {
        req: {} as Request,
        userData: undefined,
      };

      await expect(
        service.create({
          content: "Hello",
          jobId: 123,
          context: contextWithoutUser,
        }),
      ).rejects.toThrow(ProtectedRouteError);

      expect(mockJobsRepository.loadById).not.toHaveBeenCalled();
      expect(mockJobChatMessageRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error when job is not found", async () => {
      mockJobsRepository.loadById.mockResolvedValue(undefined);

      await expect(
        service.create({
          content: "Hello",
          jobId: 999,
          context: mockContext,
        }),
      ).rejects.toThrow("Job not found");

      expect(mockJobsRepository.loadById).toHaveBeenCalledWith(999, 1);
      expect(mockJobChatMessageRepository.create).not.toHaveBeenCalled();
    });

    it("should create message when user is a homeowner associated with the job", async () => {
      const job: JobModel = {
        id: 456,
        description: "Paint walls",
        location: "456 Oak Ave",
        cost: 2000,
        status: JobStatus.IN_PROGRESS,
        createdByUserId: 2,
        createdAt: "2024-01-02T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
      };

      const homeownerContext: RequestContext = {
        req: {} as Request,
        userData: {
          id: 3,
          type: UserType.HOMEOWNER,
        },
      };

      const prismaMessage: PrismaJobChatMessage = {
        id: 2,
        content: "When will you start?",
        jobId: 456,
        createdByUserId: 3,
        createdAt: new Date("2024-01-02T00:00:00Z"),
      };

      mockJobsRepository.loadById.mockResolvedValue(job);
      mockJobChatMessageRepository.create.mockResolvedValue(prismaMessage);

      const result = await service.create({
        content: "When will you start?",
        jobId: 456,
        context: homeownerContext,
      });

      expect(mockJobsRepository.loadById).toHaveBeenCalledWith(456, 3);
      expect(mockJobChatMessageRepository.create).toHaveBeenCalledWith({
        content: "When will you start?",
        jobId: 456,
        createdByUserId: 3,
      });
      expect(result).toEqual({ data: prismaMessage });
    });

    it("should handle empty content", async () => {
      const job: JobModel = {
        id: 789,
        description: "Fix plumbing",
        location: "789 Elm St",
        cost: 1500,
        status: JobStatus.PLANNING,
        createdByUserId: 1,
        createdAt: "2024-01-03T00:00:00.000Z",
        updatedAt: "2024-01-03T00:00:00.000Z",
      };

      const prismaMessage: PrismaJobChatMessage = {
        id: 3,
        content: "",
        jobId: 789,
        createdByUserId: 1,
        createdAt: new Date("2024-01-03T00:00:00Z"),
      };

      mockJobsRepository.loadById.mockResolvedValue(job);
      mockJobChatMessageRepository.create.mockResolvedValue(prismaMessage);

      const result = await service.create({
        content: "",
        jobId: 789,
        context: mockContext,
      });

      expect(mockJobChatMessageRepository.create).toHaveBeenCalledWith({
        content: "",
        jobId: 789,
        createdByUserId: 1,
      });
      expect(result).toEqual({ data: prismaMessage });
    });
  });

  describe("loadAllByJobId", () => {
    it("should return messages when user is authenticated and job exists", async () => {
      const job: JobModel = {
        id: 123,
        description: "Fix roof",
        location: "123 Main St",
        cost: 5000,
        status: JobStatus.PLANNING,
        createdByUserId: 1,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      const messages = [
        {
          id: 1,
          content: "Hello, when can we start?",
          jobId: 123,
          createdByUserId: 1,
          createdAt: "2024-01-01T00:00:00.000Z",
        },
        {
          id: 2,
          content: "We can start next week",
          jobId: 123,
          createdByUserId: 2,
          createdAt: "2024-01-02T00:00:00.000Z",
        },
      ];

      mockJobsRepository.loadById.mockResolvedValue(job);
      mockJobChatMessageRepository.loadAllByJobId.mockResolvedValue(messages);

      const result = await service.loadAllByJobId({
        jobId: 123,
        context: mockContext,
      });

      expect(mockJobsRepository.loadById).toHaveBeenCalledWith(123, 1);
      expect(mockJobChatMessageRepository.loadAllByJobId).toHaveBeenCalledWith(
        123,
      );
      expect(result).toEqual(messages);
    });

    it("should throw ProtectedRouteError when user is not authenticated", async () => {
      const contextWithoutUser: RequestContext = {
        req: {} as Request,
        userData: undefined,
      };

      await expect(
        service.loadAllByJobId({
          jobId: 123,
          context: contextWithoutUser,
        }),
      ).rejects.toThrow(ProtectedRouteError);

      expect(mockJobsRepository.loadById).not.toHaveBeenCalled();
      expect(
        mockJobChatMessageRepository.loadAllByJobId,
      ).not.toHaveBeenCalled();
    });

    it("should return empty array when job is not found", async () => {
      mockJobsRepository.loadById.mockResolvedValue(undefined);

      const result = await service.loadAllByJobId({
        jobId: 999,
        context: mockContext,
      });

      expect(mockJobsRepository.loadById).toHaveBeenCalledWith(999, 1);
      expect(
        mockJobChatMessageRepository.loadAllByJobId,
      ).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("should return empty array when no messages exist for the job", async () => {
      const job: JobModel = {
        id: 456,
        description: "Paint walls",
        location: "456 Oak Ave",
        cost: 2000,
        status: JobStatus.IN_PROGRESS,
        createdByUserId: 1,
        createdAt: "2024-01-02T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
      };

      mockJobsRepository.loadById.mockResolvedValue(job);
      mockJobChatMessageRepository.loadAllByJobId.mockResolvedValue([]);

      const result = await service.loadAllByJobId({
        jobId: 456,
        context: mockContext,
      });

      expect(mockJobsRepository.loadById).toHaveBeenCalledWith(456, 1);
      expect(mockJobChatMessageRepository.loadAllByJobId).toHaveBeenCalledWith(
        456,
      );
      expect(result).toEqual([]);
    });

    it("should return messages when user is a homeowner associated with the job", async () => {
      const job: JobModel = {
        id: 789,
        description: "Fix plumbing",
        location: "789 Elm St",
        cost: 1500,
        status: JobStatus.PLANNING,
        createdByUserId: 2,
        createdAt: "2024-01-03T00:00:00.000Z",
        updatedAt: "2024-01-03T00:00:00.000Z",
      };

      const homeownerContext: RequestContext = {
        req: {} as Request,
        userData: {
          id: 3,
          type: UserType.HOMEOWNER,
        },
      };

      const messages = [
        {
          id: 3,
          content: "When will you start?",
          jobId: 789,
          createdByUserId: 3,
          createdAt: "2024-01-03T00:00:00.000Z",
        },
      ];

      mockJobsRepository.loadById.mockResolvedValue(job);
      mockJobChatMessageRepository.loadAllByJobId.mockResolvedValue(messages);

      const result = await service.loadAllByJobId({
        jobId: 789,
        context: homeownerContext,
      });

      expect(mockJobsRepository.loadById).toHaveBeenCalledWith(789, 3);
      expect(mockJobChatMessageRepository.loadAllByJobId).toHaveBeenCalledWith(
        789,
      );
      expect(result).toEqual(messages);
    });
  });
});
