import type { JobModel } from "~/models/job";
import type { DbClient } from "~/server/db";
import type { Prisma, Job as PrismaJob } from "generated/prisma";

type LoadJobsPayload = {
  createdByUserId?: number;
  homeownerId?: number;
  limit: number;
  page: number;
};

type LoadJobsResult = {
  page: number;
  limit: number;
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
};

type DeleteJobPayload = {
  id: number;
  deletedByUserId: number;
};

export class JobsRepository {
  constructor(private readonly db: DbClient) {}

  async load(payload: LoadJobsPayload): Promise<LoadJobsResult> {
    const { limit, page, homeownerId, createdByUserId } = payload;

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

    const jobs = await this.db.job.findMany({
      skip: limit * (page - 1),
      take: limit,
      where,
      orderBy: {
        createdAt: "asc",
      },
    });

    return {
      page,
      limit,
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
    const { cost, description, location, homeownerIds, id: jobId } = payload;
    const result = await this.db.job.update({
      where: {
        id: jobId,
      },
      data: {
        cost,
        description,
        location,
        updatedAt: new Date(),
        homeowners: homeownerIds?.length
          ? {
              connect: homeownerIds.map((id) => ({ id })),
            }
          : undefined,
      },
    });

    return this.mapJobToDomain(result);
  }

  async loadById(id: number) {
    const jobResult = await this.db.job.findFirst({
      where: {
        id,
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
      deletedAt: job.deletedAt,
      deletedByUserId: job.deletedByUserId,
    };
  }
}
