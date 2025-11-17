import type { RequestContext } from "~/server/request_context";
import type {
  CreateJobChatMessagePayload,
  JobChatMessageService,
} from "~/server/service/job_chat_message/job_chat_message.service";
import { adaptServiceCall } from "../../resolvers";
import type { DataLoaders } from "../../dataloaders";

export function buildJobChatMessagesResolvers({
  jobChatMessageService,
  dataLoaders,
}: {
  jobChatMessageService: JobChatMessageService;
  dataLoaders: DataLoaders;
}) {
  return {
    Query: {
      jobChatMessages: (
        _: unknown,
        { jobId }: { jobId: number },
        context: RequestContext,
      ) => {
        return adaptServiceCall(() =>
          jobChatMessageService.loadAllByJobId({ jobId, context }),
        );
      },
    },
    Job: {
      jobChatMessages: (
        parent: { id: number },
        _: unknown,
        context: RequestContext,
      ) => {
        return adaptServiceCall(() =>
          jobChatMessageService.loadAllByJobId({
            jobId: parent.id,
            context,
          }),
        );
      },
    },
    JobChatMessage: {
      createdByUser: (
        parent: { createdByUserId: number },
        _: unknown,
        context: RequestContext,
      ) => {
        return dataLoaders.users(context).load(parent.createdByUserId);
      },
    },
    Mutation: {
      createJobChatMessage: (
        _: unknown,
        { input }: { input: CreateJobChatMessageInput },
        context: RequestContext,
      ) => {
        return adaptServiceCall(() => {
          return jobChatMessageService.create({ ...input, context });
        });
      },
    },
  };
}

type CreateJobChatMessageInput = Pick<
  CreateJobChatMessagePayload,
  "content" | "jobId"
>;
