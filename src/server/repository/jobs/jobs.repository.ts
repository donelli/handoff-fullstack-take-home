import type { JobModel } from "~/models/job";
import type { DbClient } from "~/server/db";
import {
  type JobStatus as PrismaJobStatus,
  type Prisma,
  type Job as PrismaJob,
  type JobTask as PrismaJobTask,
} from "generated/prisma";
import { JobStatus } from "~/models/job";

export type LoadJobsSortField =
  | "START_DATE"
  | "END_DATE"
  | "UPDATED_AT"
  | "CREATED_AT"
  | "STATUS";

export type LoadJobsSortDirection = "ASC" | "DESC";

type LoadJobsPayload = {
  createdByUserId?: number;
  homeownerId?: number;
  limit: number;
  page: number;
  status?: JobStatus[];
  sortField?: LoadJobsSortField;
  sortDirection?: LoadJobsSortDirection;
};

type LoadJobsResult = {
  page: number;
  limit: number;
  total: number;
  data: JobModel[];
};

export type JobTaskCreatePayload = {
  description: string;
  cost: number;
};

export type CreateJobPayload = {
  description: string;
  location: string;
  cost: number;
  homeownerIds: number[];
  createdByUserId: number;
  startDate?: string | null;
  endDate?: string | null;
  tasks: JobTaskCreatePayload[];
};

export type UpdateJobTaskPayload = {
  id: number;
  completedByUserId?: number;
  completedAt?: string | null;
};

export type JobTaskUpdatePayload = {
  id?: number;
  description?: string;
  cost?: number;
};

export type UpdateJobPayload = {
  id: number;

  description?: string;
  location?: string;
  cost?: number;
  homeownerIds?: number[];
  status?: JobStatus;
  startDate?: string | null;
  endDate?: string | null;
  tasks?: JobTaskUpdatePayload[];
};

type DeleteJobPayload = {
  id: number;
  deletedByUserId: number;
};

export class JobsRepository {
  constructor(private readonly db: DbClient) {}

  async load(payload: LoadJobsPayload): Promise<LoadJobsResult> {
    const {
      limit,
      page,
      homeownerId,
      createdByUserId,
      status,
      sortField,
      sortDirection,
    } = payload;

    const where: Prisma.JobFindManyArgs["where"] = {
      deletedAt: {
        equals: null,
      },
    };

    if (homeownerId) {
      where.homeowners = {
        some: {
          id: {
            equals: homeownerId,
          },
        },
      };
    }

    if (createdByUserId) {
      where.createdByUserId = {
        equals: createdByUserId,
      };
    }

    if (status) {
      where.status = {
        in: status,
      };
    }

    let orderBy: Prisma.JobFindManyArgs["orderBy"];
    const prismaSortDirection = sortDirection === "ASC" ? "asc" : "desc";
    switch (sortField ?? "CREATED_AT") {
      case "START_DATE":
        orderBy = { startDate: prismaSortDirection };
        break;
      case "END_DATE":
        orderBy = { endDate: prismaSortDirection };
        break;
      case "UPDATED_AT":
        orderBy = { updatedAt: prismaSortDirection };
        break;
      case "CREATED_AT":
        orderBy = { createdAt: prismaSortDirection };
        break;
      case "STATUS":
        orderBy = { status: prismaSortDirection };
        break;
    }

    const [jobs, total] = await Promise.all([
      this.db.job.findMany({
        skip: limit * (page - 1),
        take: limit,
        where,
        orderBy,
      }),
      this.db.job.count({ where }),
    ]);

    return {
      page,
      limit,
      total,
      data: jobs.map((job) => this.mapJobToDomain(job)),
    };
  }

  async create(payload: CreateJobPayload) {
    const {
      cost,
      description,
      location,
      createdByUserId,
      homeownerIds,
      startDate,
      endDate,
      tasks,
    } = payload;

    const result = await this.db.job.create({
      data: {
        cost,
        description,
        location,
        createdByUserId,
        status: "PLANNING",
        homeowners: {
          connect: homeownerIds.map((id) => ({ id })),
        },
        startDate,
        endDate,
        tasks: {
          create: tasks.map((task) => ({
            description: task.description,
            cost: task.cost,
          })),
        },
      },
    });

    return this.mapJobToDomain(result);
  }

  async update(payload: UpdateJobPayload) {
    const {
      cost,
      description,
      location,
      homeownerIds,
      id: jobId,
      status,
      startDate,
      endDate,
      tasks,
    } = payload;

    let tasksNestedInput:
      | Prisma.JobTaskUpdateManyWithoutJobNestedInput
      | undefined;
    if (tasks !== undefined) {
      const existingTasks = await this.db.jobTask.findMany({
        where: { jobId },
      });

      const existingTaskIds = new Set(existingTasks.map((task) => task.id));
      const payloadTaskIds = new Set(
        tasks.filter((task) => task.id !== undefined).map((task) => task.id!),
      );

      const tasksToDelete = existingTasks
        .filter((task) => !payloadTaskIds.has(task.id))
        .map((task) => task.id);

      const taskUpdates: Prisma.JobTaskUpdateWithWhereUniqueWithoutJobInput[] =
        [];
      const taskCreates: Prisma.JobTaskCreateWithoutJobInput[] = [];

      for (const task of tasks) {
        if (task.id !== undefined && existingTaskIds.has(task.id)) {
          const updateData: Prisma.JobTaskUncheckedUpdateWithoutJobInput = {};
          if (task.description !== undefined) {
            updateData.description = task.description;
          }
          if (task.cost !== undefined) {
            updateData.cost = task.cost;
          }

          if (Object.keys(updateData).length > 0) {
            taskUpdates.push({
              where: { id: task.id },
              data: updateData,
            });
          }
        } else {
          if (task.description !== undefined && task.cost !== undefined) {
            taskCreates.push({
              description: task.description,
              cost: task.cost,
            });
          }
        }
      }

      tasksNestedInput = {};
      if (tasksToDelete.length > 0) {
        tasksNestedInput.deleteMany = {
          id: { in: tasksToDelete },
        };
      }
      if (taskUpdates.length > 0) {
        tasksNestedInput.update = taskUpdates;
      }
      if (taskCreates.length > 0) {
        tasksNestedInput.create = taskCreates;
      }

      if (
        tasksToDelete.length === 0 &&
        taskUpdates.length === 0 &&
        taskCreates.length === 0
      ) {
        tasksNestedInput = undefined;
      }
    }

    const result = await this.db.job.update({
      where: {
        id: jobId,
      },
      data: {
        cost,
        description,
        location,
        updatedAt: new Date(),
        status,
        homeowners:
          homeownerIds !== undefined
            ? {
                set: homeownerIds.map((id) => ({ id })),
              }
            : undefined,
        startDate: startDate,
        endDate: endDate,
        ...(tasksNestedInput && { tasks: tasksNestedInput }),
      },
    });

    return this.mapJobToDomain(result);
  }

  async loadById(id: number, userIdForPermissionCheck: number) {
    const jobResult = await this.db.job.findFirst({
      where: {
        id,
        OR: [
          {
            createdByUserId: {
              equals: userIdForPermissionCheck,
            },
          },
          {
            homeowners: {
              some: {
                id: {
                  equals: userIdForPermissionCheck,
                },
              },
            },
          },
        ],
      },
    });

    return jobResult ? this.mapJobToDomain(jobResult) : undefined;
  }

  async delete(payload: DeleteJobPayload) {
    const { deletedByUserId, id } = payload;

    await this.db.job.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedByUserId,
      },
    });
  }

  mapJobToDomain(job: PrismaJob): JobModel {
    return {
      id: job.id,
      description: job.description,
      createdByUserId: job.createdByUserId,
      cost: job.cost,
      location: job.location,
      deletedAt: job.deletedAt?.toISOString(),
      deletedByUserId: job.deletedByUserId,
      status: this.mapJobStatusToDomain(job.status),
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
      startDate: job.startDate?.toISOString(),
      endDate: job.endDate?.toISOString(),
    };
  }

  mapJobStatusToDomain(status: PrismaJobStatus): JobStatus {
    switch (status) {
      case "PLANNING":
        return JobStatus.PLANNING;
      case "IN_PROGRESS":
        return JobStatus.IN_PROGRESS;
      case "COMPLETED":
        return JobStatus.COMPLETED;
      case "CANCELED":
        return JobStatus.CANCELED;
    }
  }

  async loadTasksByJobId(jobId: number) {
    const tasks = await this.db.jobTask.findMany({
      where: {
        jobId,
      },
    });

    return tasks.map((task) => this.mapTaskToDomain(task));
  }

  async updateJobTask(payload: UpdateJobTaskPayload) {
    const { id, completedByUserId, completedAt } = payload;

    const result = await this.db.jobTask.update({
      where: { id },
      data: { completedByUserId, completedAt },
    });

    return this.mapTaskToDomain(result);
  }

  mapTaskToDomain(task: PrismaJobTask) {
    return {
      id: task.id,
      description: task.description,
      cost: task.cost,
      completedAt: task.completedAt?.toISOString(),
      completedByUserId: task.completedByUserId,
    };
  }
}
