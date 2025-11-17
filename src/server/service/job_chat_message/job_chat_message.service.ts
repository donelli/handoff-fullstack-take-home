import { ProtectedRouteError } from "~/server/error/protected_route_error";
import type { JobChatMessageRepository } from "~/server/repository/job_chat_message/job_chat_message.repository";
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
  ) {}

  async create(payload: CreateJobChatMessagePayload) {
    const { content, jobId, context } = payload;

    if (!context.userData) {
      throw new ProtectedRouteError();
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

    return this.jobChatMessageRepository.loadAllByJobId(jobId);
  }
}
