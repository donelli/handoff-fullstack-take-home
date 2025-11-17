import { ProtectedRouteError } from "~/server/error/protected_route_error";
import type { JobChatMessageRepository } from "~/server/repository/job_chat_message/job_chat_message.repository";
import type { JobsRepository } from "~/server/repository/jobs/jobs.repository";
import type { RequestContext } from "~/server/request_context";

export type CreateJobChatMessagePayload = {
  content: string;
  jobId: number;
  context: RequestContext;
};

export type LoadAllByJobIdPayload = {
  jobId: number;
  context: RequestContext;
};

export class JobChatMessageService {
  constructor(
    private readonly jobChatMessageRepository: JobChatMessageRepository,
    private readonly jobsRepository: JobsRepository,
  ) {}

  async create(payload: CreateJobChatMessagePayload) {
    const { content, jobId, context } = payload;

    if (!context.userData) {
      throw new ProtectedRouteError();
    }

    const job = await this.jobsRepository.loadById(jobId, context.userData.id);
    if (!job) {
      throw new Error("Job not found");
    }

    const createdJobChatMessage = await this.jobChatMessageRepository.create({
      content,
      jobId,
      createdByUserId: context.userData.id,
    });

    return { data: createdJobChatMessage };
  }

  async loadAllByJobId(payload: LoadAllByJobIdPayload) {
    const { context, jobId } = payload;

    if (!context.userData) {
      throw new ProtectedRouteError();
    }

    const job = await this.jobsRepository.loadById(jobId, context.userData.id);
    if (!job) {
      return [];
    }

    return this.jobChatMessageRepository.loadAllByJobId(jobId);
  }
}
