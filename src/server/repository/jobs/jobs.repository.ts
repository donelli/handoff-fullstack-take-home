import type { JobModel } from "~/models/job";
import type { DbClient } from "~/server/db";
import {
  type JobStatus as PrismaJobStatus,
  type Prisma,
  type Job as PrismaJob,
} from "generated/prisma";
import { JobStatus } from "~/models/job";

type LoadJobsPayload = {
  createdByUserId?: number;
  homeownerId?: number;
  limit: number;
  page: number;
  status?: JobStatus[];
};

type LoadJobsResult = {
  page: number;
  limit: number;
  total: number;
  data: JobModel[];
};

export type CreateJobPayload = {
  description: string;
  location: string;
  cost: number;
  homeownerIds: number[];
  createdByUserId: number;
};

export type UpdateJobPayload = {
  id: number;

  description?: string;
  location?: string;
  cost?: number;
  homeownerIds?: number[];
  status?: JobStatus;
};

type DeleteJobPayload = {
  id: number;
  deletedByUserId: number;
};

export class JobsRepository {
  constructor(private readonly db: DbClient) {}

  async load(payload: LoadJobsPayload): Promise<LoadJobsResult> {
    const { limit, page, homeownerId, createdByUserId, status } = payload;

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

    const [jobs, total] = await Promise.all([
      this.db.job.findMany({
        skip: limit * (page - 1),
        take: limit,
        where,
        orderBy: {
          createdAt: "asc",
        },
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
    const { cost, description, location, createdByUserId, homeownerIds } =
      payload;

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
    } = payload;
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
}
