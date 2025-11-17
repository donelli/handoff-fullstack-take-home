import type { JobModel } from "~/models/job";
import type { DbClient } from "~/server/db";
import {
  type JobStatus as PrismaJobStatus,
  type Prisma,
  type Job as PrismaJob,
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

export type CreateJobPayload = {
  description: string;
  location: string;
  cost: number;
  homeownerIds: number[];
  createdByUserId: number;
  startDate?: string | null;
  endDate?: string | null;
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
        startDate: startDate,
        endDate: endDate,
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
}
