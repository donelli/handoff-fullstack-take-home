import type { JobStatus } from "~/models/job";
import { UserType } from "~/models/user";
import { ProtectedRouteError } from "~/server/error/protected_route_error";
import type {
  JobsRepository,
  CreateJobPayload as RepositoryCreateJobPayload,
  UpdateJobPayload as RepositoryUpdateJobPayload,
} from "~/server/repository/jobs/jobs.repository";
import type { RequestContext } from "~/server/request_context";

type LoadJobsPayload = {
  limit?: number;
  page?: number;
  status?: JobStatus[];

  context: RequestContext;
};

export type CreateJobPayload = Omit<
  RepositoryCreateJobPayload,
  "createdByUserId"
> & {
  context: RequestContext;
};

export type UpdateJobPayload = RepositoryUpdateJobPayload & {
  context: RequestContext;
};

export type DeleteJobPayload = {
  id: number;
  context: RequestContext;
};

type LoadJobByIdPayload = {
  id: number;
  context: RequestContext;
};

export type ChangeJobStatusPayload = {
  id: number;
  status: JobStatus;
  context: RequestContext;
};

export class JobsService {
  constructor(private readonly jobsRepository: JobsRepository) {}

  async loadBasedOnUser(payload: LoadJobsPayload) {
    const { context, status } = payload;
    const limit = payload.limit ?? 20;
    const page = payload.page ?? 1;

    if (!context.userData) {
      throw new ProtectedRouteError();
    }

    let createdByUserId: number | undefined;
    let homeownerId: number | undefined;

    if (context.userData.type === UserType.CONTRACTOR) {
      createdByUserId = context.userData.id;
    } else {
      homeownerId = context.userData.id;
    }

    const result = await this.jobsRepository.load({
      limit,
      page,
      createdByUserId,
      homeownerId,
      status,
    });

    return result;
  }

  async create(payload: CreateJobPayload) {
    const { context, ...body } = payload;

    body.description = body.description.trim();

    if (!body.description) {
      throw new Error("Description should not be empty");
    }

    if (!context.userData) {
      throw new ProtectedRouteError();
    }

    if (context.userData.type !== UserType.CONTRACTOR) {
      throw new Error("Only contractors can create new jobs");
    }

    const createdJob = await this.jobsRepository.create({
      ...body,
      createdByUserId: context.userData.id,
    });

    return { data: createdJob };
  }

  async loadById(payload: LoadJobByIdPayload) {
    const { context, id } = payload;

    if (!context.userData) {
      throw new ProtectedRouteError();
    }

    const job = await this.jobsRepository.loadById(id);

    return job;
  }

  async update(payload: UpdateJobPayload) {
    const { context, id: jobId, ...body } = payload;

    if (body.description) {
      body.description = body.description.trim();
    }

    if (!context.userData) {
      throw new ProtectedRouteError();
    }

    if (context.userData.type !== UserType.CONTRACTOR) {
      throw new Error("Only contractors can update jobs");
    }

    const job = await this.loadById({ id: jobId, context });
    if (!job) {
      throw new Error("Job not found");
    }

    if (job.createdByUserId !== context.userData.id) {
      throw new Error("Only the contractor that owns this job can update it");
    }

    const updatedJob = await this.jobsRepository.update({
      ...body,
      id: jobId,
    });

    return { data: updatedJob };
  }

  async delete(payload: DeleteJobPayload) {
    const { context, id } = payload;

    if (!context.userData) {
      throw new ProtectedRouteError();
    }

    if (context.userData.type !== UserType.CONTRACTOR) {
      throw new Error("Only contractors can update jobs");
    }

    const job = await this.loadById({ id, context });
    if (!job) {
      throw new Error("Job not found");
    }

    if (job.createdByUserId !== context.userData.id) {
      throw new Error("Only the contractor that owns this job can delete it");
    }

    if (job.deletedAt) {
      throw new Error("Job is already deleted");
    }

    await this.jobsRepository.delete({
      id,
      deletedByUserId: context.userData.id,
    });

    return true;
  }

  async changeStatus(payload: ChangeJobStatusPayload) {
    const { context, id, status } = payload;

    if (!context.userData) {
      throw new ProtectedRouteError();
    }

    if (context.userData.type !== UserType.CONTRACTOR) {
      throw new Error("Only contractors can change job status");
    }

    const job = await this.loadById({ id, context });
    if (!job) {
      throw new Error("Job not found");
    }

    const updatedJob = await this.jobsRepository.update({
      id,
      status,
    });

    return { data: updatedJob };
  }
}
