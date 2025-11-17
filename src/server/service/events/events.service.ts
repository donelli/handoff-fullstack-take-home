import type { JobChatMessage } from "generated/prisma";
import type { PubSub } from "graphql-subscriptions";

export class EventsService {
  constructor(private readonly pubsub: PubSub) {}

  subscribeToJobChatMessageAdded(jobId: number) {
    return this.pubsub.asyncIterableIterator<JobChatMessage>(
      `jobChatMessageAdded:${jobId}`,
    );
  }
}
