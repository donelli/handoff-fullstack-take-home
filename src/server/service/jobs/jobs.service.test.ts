/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, beforeEach } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { JobsService } from "./jobs.service";
import type { JobsRepository } from "~/server/repository/jobs/jobs.repository";
import type { JobModel } from "~/models/job";
import { JobStatus } from "~/models/job";
import { UserType } from "~/models/user";
import { ProtectedRouteError } from "~/server/error/protected_route_error";
import type { RequestContext } from "~/server/request_context";

describe("JobsService", () => {
  let mockJobsRepository: ReturnType<typeof mockDeep<JobsRepository>>;
  let service: JobsService;

  const contractorContext: RequestContext = {
    req: {} as Request,
    userData: {
      id: 1,
      type: UserType.CONTRACTOR,
    },
  };

  const homeownerContext: RequestContext = {
    req: {} as Request,
    userData: {
      id: 2,
      type: UserType.HOMEOWNER,
    },
  };

  beforeEach(() => {
    mockJobsRepository = mockDeep<JobsRepository>();
    service = new JobsService(mockJobsRepository);
  });

  describe("loadBasedOnUser", () => {
    it("should load jobs for contractor with default pagination", async () => {
      const result = {
        page: 1,
        limit: 20,
        total: 2,
        data: [
          {
            id: 1,
            description: "Fix roof",
            location: "123 Main St",
            cost: 5000,
            status: JobStatus.PLANNING,
            createdByUserId: 1,
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z",
          } as JobModel,
          {
            id: 2,
            description: "Paint walls",
            location: "456 Oak Ave",
            cost: 2000,
            status: JobStatus.IN_PROGRESS,
            createdByUserId: 1,
            createdAt: "2024-01-02T00:00:00.000Z",
            updatedAt: "2024-01-02T00:00:00.000Z",
          } as JobModel,
        ],
      };

      mockJobsRepository.load.mockResolvedValue(result);

      const jobs = await service.loadBasedOnUser({
        context: contractorContext,
      });

      expect(mockJobsRepository.load).toHaveBeenCalledWith({
        limit: 20,
        page: 1,
        createdByUserId: 1,
        homeownerId: undefined,
        status: undefined,
        sortField: "CREATED_AT",
        sortDirection: "ASC",
      });
      expect(jobs).toEqual(result);
    });

    it("should load jobs for homeowner with default pagination", async () => {
      const result = {
        page: 1,
        limit: 20,
        total: 1,
        data: [
          {
            id: 1,
            description: "Fix roof",
            location: "123 Main St",
            cost: 5000,
            status: JobStatus.PLANNING,
            createdByUserId: 1,
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z",
          } as JobModel,
        ],
      };

      mockJobsRepository.load.mockResolvedValue(result);

      const jobs = await service.loadBasedOnUser({
        context: homeownerContext,
      });

      expect(mockJobsRepository.load).toHaveBeenCalledWith({
        limit: 20,
        page: 1,
        createdByUserId: undefined,
        homeownerId: 2,
        status: undefined,
        sortField: "CREATED_AT",
        sortDirection: "ASC",
      });
      expect(jobs).toEqual(result);
    });

    it("should use custom pagination parameters", async () => {
      const result = {
        page: 2,
        limit: 10,
        total: 15,
        data: [],
      };

      mockJobsRepository.load.mockResolvedValue(result);

      const jobs = await service.loadBasedOnUser({
        context: contractorContext,
        page: 2,
        limit: 10,
      });

      expect(mockJobsRepository.load).toHaveBeenCalledWith({
        limit: 10,
        page: 2,
        createdByUserId: 1,
        homeownerId: undefined,
        status: undefined,
        sortField: "CREATED_AT",
        sortDirection: "ASC",
      });
      expect(jobs).toEqual(result);
    });

    it("should cap limit at 200", async () => {
      const result = {
        page: 1,
        limit: 200,
        total: 0,
        data: [],
      };

      mockJobsRepository.load.mockResolvedValue(result);

      await service.loadBasedOnUser({
        context: contractorContext,
        limit: 500,
      });

      expect(mockJobsRepository.load).toHaveBeenCalledWith({
        limit: 200,
        page: 1,
        createdByUserId: 1,
        homeownerId: undefined,
        status: undefined,
        sortField: "CREATED_AT",
        sortDirection: "ASC",
      });
    });

    it("should filter by status", async () => {
      const result = {
        page: 1,
        limit: 20,
        total: 1,
        data: [],
      };

      mockJobsRepository.load.mockResolvedValue(result);

      await service.loadBasedOnUser({
        context: contractorContext,
        status: [JobStatus.PLANNING, JobStatus.IN_PROGRESS],
      });

      expect(mockJobsRepository.load).toHaveBeenCalledWith({
        limit: 20,
        page: 1,
        createdByUserId: 1,
        homeownerId: undefined,
        status: [JobStatus.PLANNING, JobStatus.IN_PROGRESS],
        sortField: "CREATED_AT",
        sortDirection: "ASC",
      });
    });

    it("should use custom sort field and direction", async () => {
      const result = {
        page: 1,
        limit: 20,
        total: 2,
        data: [],
      };

      mockJobsRepository.load.mockResolvedValue(result);

      await service.loadBasedOnUser({
        context: contractorContext,
        sortField: "START_DATE",
        sortDirection: "DESC",
      });

      expect(mockJobsRepository.load).toHaveBeenCalledWith({
        limit: 20,
        page: 1,
        createdByUserId: 1,
        homeownerId: undefined,
        status: undefined,
        sortField: "START_DATE",
        sortDirection: "DESC",
      });
    });

    it("should throw ProtectedRouteError when user is not authenticated", async () => {
      const contextWithoutUser: RequestContext = {
        req: {} as Request,
        userData: undefined,
      };

      await expect(
        service.loadBasedOnUser({
          context: contextWithoutUser,
        }),
      ).rejects.toThrow(ProtectedRouteError);

      expect(mockJobsRepository.load).not.toHaveBeenCalled();
    });
  });

  describe("create", () => {
    const job: JobModel = {
      id: 1,
      description: "Fix roof",
      location: "123 Main St",
      cost: 5000,
      status: JobStatus.PLANNING,
      createdByUserId: 1,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };

    it("should create a job when contractor is authenticated", async () => {
      mockJobsRepository.create.mockResolvedValue(job);

      const result = await service.create({
        context: contractorContext,
        description: "Fix roof",
        location: "123 Main St",
        cost: 5000,
        homeownerIds: [2, 3],
        tasks: [],
      });

      expect(mockJobsRepository.create).toHaveBeenCalledWith({
        description: "Fix roof",
        location: "123 Main St",
        cost: 5000,
        homeownerIds: [2, 3],
        createdByUserId: 1,
        tasks: [],
      });
      expect(result).toEqual({ data: job });
    });

    it("should trim description before creating", async () => {
      mockJobsRepository.create.mockResolvedValue(job);

      await service.create({
        context: contractorContext,
        description: "  Fix roof  ",
        location: "123 Main St",
        cost: 5000,
        homeownerIds: [],
        tasks: [],
      });

      expect(mockJobsRepository.create).toHaveBeenCalledWith({
        description: "Fix roof",
        location: "123 Main St",
        cost: 5000,
        homeownerIds: [],
        createdByUserId: 1,
        tasks: [],
      });
    });

    it("should throw error when description is empty after trim", async () => {
      await expect(
        service.create({
          context: contractorContext,
          description: "   ",
          location: "123 Main St",
          cost: 5000,
          homeownerIds: [],
          tasks: [],
        }),
      ).rejects.toThrow("Description should not be empty");

      expect(mockJobsRepository.create).not.toHaveBeenCalled();
    });

    it("should throw ProtectedRouteError when user is not authenticated", async () => {
      const contextWithoutUser: RequestContext = {
        req: {} as Request,
        userData: undefined,
      };

      await expect(
        service.create({
          context: contextWithoutUser,
          description: "Fix roof",
          location: "123 Main St",
          cost: 5000,
          homeownerIds: [],
          tasks: [],
        }),
      ).rejects.toThrow(ProtectedRouteError);

      expect(mockJobsRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error when homeowner tries to create job", async () => {
      await expect(
        service.create({
          context: homeownerContext,
          description: "Fix roof",
          location: "123 Main St",
          cost: 5000,
          homeownerIds: [],
          tasks: [],
        }),
      ).rejects.toThrow("Only contractors can create new jobs");

      expect(mockJobsRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("loadById", () => {
    const job: JobModel = {
      id: 1,
      description: "Fix roof",
      location: "123 Main St",
      cost: 5000,
      status: JobStatus.PLANNING,
      createdByUserId: 1,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };

    it("should load job by id when contractor is authenticated", async () => {
      mockJobsRepository.loadById.mockResolvedValue(job);

      const result = await service.loadById({
        context: contractorContext,
        id: 1,
      });

      expect(mockJobsRepository.loadById).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(job);
    });

    it("should load job by id when homeowner is authenticated", async () => {
      mockJobsRepository.loadById.mockResolvedValue(job);

      const result = await service.loadById({
        context: homeownerContext,
        id: 1,
      });

      expect(mockJobsRepository.loadById).toHaveBeenCalledWith(1, 2);
      expect(result).toEqual(job);
    });

    it("should return undefined when job is not found", async () => {
      mockJobsRepository.loadById.mockResolvedValue(undefined);

      const result = await service.loadById({
        context: contractorContext,
        id: 999,
      });

      expect(mockJobsRepository.loadById).toHaveBeenCalledWith(999, 1);
      expect(result).toBeUndefined();
    });

    it("should throw ProtectedRouteError when user is not authenticated", async () => {
      const contextWithoutUser: RequestContext = {
        req: {} as Request,
        userData: undefined,
      };

      await expect(
        service.loadById({
          context: contextWithoutUser,
          id: 1,
        }),
      ).rejects.toThrow(ProtectedRouteError);

      expect(mockJobsRepository.loadById).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    const existingJob: JobModel = {
      id: 1,
      description: "Fix roof",
      location: "123 Main St",
      cost: 5000,
      status: JobStatus.PLANNING,
      createdByUserId: 1,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };

    const updatedJob: JobModel = {
      ...existingJob,
      description: "Fix roof updated",
      cost: 6000,
      updatedAt: "2024-01-02T00:00:00.000Z",
    };

    it("should update job when contractor owns it", async () => {
      mockJobsRepository.loadById.mockResolvedValue(existingJob);
      mockJobsRepository.update.mockResolvedValue(updatedJob);

      const result = await service.update({
        context: contractorContext,
        id: 1,
        description: "Fix roof updated",
        cost: 6000,
      });

      expect(mockJobsRepository.loadById).toHaveBeenCalledWith(1, 1);
      expect(mockJobsRepository.update).toHaveBeenCalledWith({
        id: 1,
        description: "Fix roof updated",
        cost: 6000,
      });
      expect(result).toEqual({ data: updatedJob });
    });

    it("should trim description when provided", async () => {
      mockJobsRepository.loadById.mockResolvedValue(existingJob);
      mockJobsRepository.update.mockResolvedValue(updatedJob);

      await service.update({
        context: contractorContext,
        id: 1,
        description: "  Fix roof updated  ",
      });

      expect(mockJobsRepository.update).toHaveBeenCalledWith({
        id: 1,
        description: "Fix roof updated",
      });
    });

    it("should throw ProtectedRouteError when user is not authenticated", async () => {
      const contextWithoutUser: RequestContext = {
        req: {} as Request,
        userData: undefined,
      };

      await expect(
        service.update({
          context: contextWithoutUser,
          id: 1,
          description: "Updated",
        }),
      ).rejects.toThrow(ProtectedRouteError);

      expect(mockJobsRepository.update).not.toHaveBeenCalled();
    });

    it("should throw error when homeowner tries to update job", async () => {
      await expect(
        service.update({
          context: homeownerContext,
          id: 1,
          description: "Updated",
        }),
      ).rejects.toThrow("Only contractors can update jobs");

      expect(mockJobsRepository.update).not.toHaveBeenCalled();
    });

    it("should throw error when job is not found", async () => {
      mockJobsRepository.loadById.mockResolvedValue(undefined);

      await expect(
        service.update({
          context: contractorContext,
          id: 999,
          description: "Updated",
        }),
      ).rejects.toThrow("Job not found");

      expect(mockJobsRepository.update).not.toHaveBeenCalled();
    });

    it("should throw error when contractor does not own the job", async () => {
      const otherContractorJob: JobModel = {
        ...existingJob,
        createdByUserId: 999,
      };

      mockJobsRepository.loadById.mockResolvedValue(otherContractorJob);

      await expect(
        service.update({
          context: contractorContext,
          id: 1,
          description: "Updated",
        }),
      ).rejects.toThrow("Only the contractor that owns this job can update it");

      expect(mockJobsRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    const existingJob: JobModel = {
      id: 1,
      description: "Fix roof",
      location: "123 Main St",
      cost: 5000,
      status: JobStatus.PLANNING,
      createdByUserId: 1,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };

    it("should delete job when contractor owns it", async () => {
      mockJobsRepository.loadById.mockResolvedValue(existingJob);
      mockJobsRepository.delete.mockResolvedValue(undefined);

      const result = await service.delete({
        context: contractorContext,
        id: 1,
      });

      expect(mockJobsRepository.loadById).toHaveBeenCalledWith(1, 1);
      expect(mockJobsRepository.delete).toHaveBeenCalledWith({
        id: 1,
        deletedByUserId: 1,
      });
      expect(result).toBe(true);
    });

    it("should throw ProtectedRouteError when user is not authenticated", async () => {
      const contextWithoutUser: RequestContext = {
        req: {} as Request,
        userData: undefined,
      };

      await expect(
        service.delete({
          context: contextWithoutUser,
          id: 1,
        }),
      ).rejects.toThrow(ProtectedRouteError);

      expect(mockJobsRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw error when homeowner tries to delete job", async () => {
      await expect(
        service.delete({
          context: homeownerContext,
          id: 1,
        }),
      ).rejects.toThrow("Only contractors can update jobs");

      expect(mockJobsRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw error when job is not found", async () => {
      mockJobsRepository.loadById.mockResolvedValue(undefined);

      await expect(
        service.delete({
          context: contractorContext,
          id: 999,
        }),
      ).rejects.toThrow("Job not found");

      expect(mockJobsRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw error when contractor does not own the job", async () => {
      const otherContractorJob: JobModel = {
        ...existingJob,
        createdByUserId: 999,
      };

      mockJobsRepository.loadById.mockResolvedValue(otherContractorJob);

      await expect(
        service.delete({
          context: contractorContext,
          id: 1,
        }),
      ).rejects.toThrow("Only the contractor that owns this job can delete it");

      expect(mockJobsRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw error when job is already deleted", async () => {
      const deletedJob: JobModel = {
        ...existingJob,
        deletedAt: "2024-01-02T00:00:00.000Z",
        deletedByUserId: 1,
      };

      mockJobsRepository.loadById.mockResolvedValue(deletedJob);

      await expect(
        service.delete({
          context: contractorContext,
          id: 1,
        }),
      ).rejects.toThrow("Job is already deleted");

      expect(mockJobsRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe("changeStatus", () => {
    const existingJob: JobModel = {
      id: 1,
      description: "Fix roof",
      location: "123 Main St",
      cost: 5000,
      status: JobStatus.PLANNING,
      createdByUserId: 1,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };

    const updatedJob: JobModel = {
      ...existingJob,
      status: JobStatus.IN_PROGRESS,
      updatedAt: "2024-01-02T00:00:00.000Z",
    };

    it("should change job status when contractor is authenticated", async () => {
      mockJobsRepository.loadById.mockResolvedValue(existingJob);
      mockJobsRepository.update.mockResolvedValue(updatedJob);

      const result = await service.changeStatus({
        context: contractorContext,
        id: 1,
        status: JobStatus.IN_PROGRESS,
      });

      expect(mockJobsRepository.loadById).toHaveBeenCalledWith(1, 1);
      expect(mockJobsRepository.update).toHaveBeenCalledWith({
        id: 1,
        status: JobStatus.IN_PROGRESS,
      });
      expect(result).toEqual({ data: updatedJob });
    });

    it("should change status to COMPLETED", async () => {
      const completedJob: JobModel = {
        ...existingJob,
        status: JobStatus.COMPLETED,
      };

      mockJobsRepository.loadById.mockResolvedValue(existingJob);
      mockJobsRepository.update.mockResolvedValue(completedJob);

      const result = await service.changeStatus({
        context: contractorContext,
        id: 1,
        status: JobStatus.COMPLETED,
      });

      expect(mockJobsRepository.update).toHaveBeenCalledWith({
        id: 1,
        status: JobStatus.COMPLETED,
      });
      expect(result).toEqual({ data: completedJob });
    });

    it("should throw ProtectedRouteError when user is not authenticated", async () => {
      const contextWithoutUser: RequestContext = {
        req: {} as Request,
        userData: undefined,
      };

      await expect(
        service.changeStatus({
          context: contextWithoutUser,
          id: 1,
          status: JobStatus.IN_PROGRESS,
        }),
      ).rejects.toThrow(ProtectedRouteError);

      expect(mockJobsRepository.update).not.toHaveBeenCalled();
    });

    it("should throw error when homeowner tries to change status", async () => {
      await expect(
        service.changeStatus({
          context: homeownerContext,
          id: 1,
          status: JobStatus.IN_PROGRESS,
        }),
      ).rejects.toThrow("Only contractors can change job status");

      expect(mockJobsRepository.update).not.toHaveBeenCalled();
    });

    it("should throw error when job is not found", async () => {
      mockJobsRepository.loadById.mockResolvedValue(undefined);

      await expect(
        service.changeStatus({
          context: contractorContext,
          id: 999,
          status: JobStatus.IN_PROGRESS,
        }),
      ).rejects.toThrow("Job not found");

      expect(mockJobsRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("loadTasksByJobId", () => {
    const tasks = [
      {
        id: 1,
        description: "Task 1",
        cost: 1000,
        completedAt: undefined,
        completedByUserId: null,
      },
      {
        id: 2,
        description: "Task 2",
        cost: 2000,
        completedAt: "2024-01-02T00:00:00.000Z",
        completedByUserId: 1,
      },
    ];

    it("should load tasks by job id when user is authenticated", async () => {
      mockJobsRepository.loadTasksByJobId.mockResolvedValue(tasks);

      const result = await service.loadTasksByJobId({
        context: contractorContext,
        id: 1,
      });

      expect(mockJobsRepository.loadTasksByJobId).toHaveBeenCalledWith(1);
      expect(result).toEqual(tasks);
    });

    it("should load tasks by job id when homeowner is authenticated", async () => {
      mockJobsRepository.loadTasksByJobId.mockResolvedValue(tasks);

      const result = await service.loadTasksByJobId({
        context: homeownerContext,
        id: 1,
      });

      expect(mockJobsRepository.loadTasksByJobId).toHaveBeenCalledWith(1);
      expect(result).toEqual(tasks);
    });

    it("should throw ProtectedRouteError when user is not authenticated", async () => {
      const contextWithoutUser: RequestContext = {
        req: {} as Request,
        userData: undefined,
      };

      await expect(
        service.loadTasksByJobId({
          context: contextWithoutUser,
          id: 1,
        }),
      ).rejects.toThrow(ProtectedRouteError);

      expect(mockJobsRepository.loadTasksByJobId).not.toHaveBeenCalled();
    });

    it("should return empty array when no tasks exist", async () => {
      mockJobsRepository.loadTasksByJobId.mockResolvedValue([]);

      const result = await service.loadTasksByJobId({
        context: contractorContext,
        id: 1,
      });

      expect(mockJobsRepository.loadTasksByJobId).toHaveBeenCalledWith(1);
      expect(result).toEqual([]);
    });
  });

  describe("completeJobTask", () => {
    const completedTask = {
      id: 1,
      description: "Task 1",
      cost: 1000,
      completedAt: "2024-01-02T00:00:00.000Z",
      completedByUserId: 1,
    };

    it("should complete a job task when contractor is authenticated", async () => {
      mockJobsRepository.updateJobTask.mockResolvedValue(completedTask);

      const result = await service.completeJobTask({
        context: contractorContext,
        id: 1,
      });

      expect(mockJobsRepository.updateJobTask).toHaveBeenCalledWith({
        id: 1,
        completedByUserId: 1,
        completedAt: expect.any(String) as string,
      });
      expect(result).toEqual({ data: completedTask });
      expect(result.data.completedByUserId).toBe(1);
      expect(result.data.completedAt).toBeDefined();
    });

    it("should throw ProtectedRouteError when user is not authenticated", async () => {
      const contextWithoutUser: RequestContext = {
        req: {} as Request,
        userData: undefined,
      };

      await expect(
        service.completeJobTask({
          context: contextWithoutUser,
          id: 1,
        }),
      ).rejects.toThrow(ProtectedRouteError);

      expect(mockJobsRepository.updateJobTask).not.toHaveBeenCalled();
    });

    it("should throw error when homeowner tries to complete task", async () => {
      await expect(
        service.completeJobTask({
          context: homeownerContext,
          id: 1,
        }),
      ).rejects.toThrow("Only contractors can complete job tasks");

      expect(mockJobsRepository.updateJobTask).not.toHaveBeenCalled();
    });

    it("should set completedAt timestamp when completing task", async () => {
      const beforeTime = new Date().toISOString();
      mockJobsRepository.updateJobTask.mockResolvedValue(completedTask);

      await service.completeJobTask({
        context: contractorContext,
        id: 1,
      });

      const afterTime = new Date().toISOString();
      const callArgs = mockJobsRepository.updateJobTask.mock.calls[0]?.[0];
      expect(callArgs?.completedAt).toBeDefined();
      if (callArgs?.completedAt) {
        const completedAtTime = new Date(callArgs.completedAt).toISOString();
        expect(completedAtTime >= beforeTime).toBe(true);
        expect(completedAtTime <= afterTime).toBe(true);
      }
    });
  });
});
