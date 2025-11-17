import type { JobChatMessage } from "generated/prisma";
import type { DbClient } from "~/server/db";

export type CreateJobChatMessagePayload = {
  content: string;
  jobId: number;
  createdByUserId: number;
};

export class JobChatMessageRepository {
  constructor(private readonly db: DbClient) {}

  create(payload: CreateJobChatMessagePayload) {
    const { content, jobId, createdByUserId } = payload;

    return this.db.jobChatMessage.create({
      data: {
        content,
        jobId,
        createdByUserId,
      },
    });
  }

  async loadAllByJobId(jobId: number) {
    const messages = await this.db.jobChatMessage.findMany({
      where: {
        jobId,
      },
    });

    return messages.map((message) => this.mapToDomainJobChatMessage(message));
  }

  mapToDomainJobChatMessage(prismaJobChatMessage: JobChatMessage) {
    return {
      id: prismaJobChatMessage.id,
      content: prismaJobChatMessage.content,
      jobId: prismaJobChatMessage.jobId,
      createdByUserId: prismaJobChatMessage.createdByUserId,
      createdAt: prismaJobChatMessage.createdAt.toISOString(),
    };
  }
}
