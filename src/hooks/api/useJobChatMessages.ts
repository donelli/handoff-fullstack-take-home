import { useQuery, gql } from "@apollo/client";

const JOB_CHAT_MESSAGES_QUERY = gql`
  query JobChatMessages($jobId: Int!) {
    jobChatMessages(jobId: $jobId) {
      id
      content
      createdAt
      createdByUserId
      createdByUser {
        id
        name
      }
    }
  }
`;

export type JobChatMessage = {
  id: number;
  content: string;
  createdAt: string;
  createdByUserId: number;
  createdByUser: {
    id: number;
    name: string;
  };
};

export type JobChatMessagesQueryResponse = {
  jobChatMessages: JobChatMessage[];
};

export function useJobChatMessages(jobId: number) {
  const { data, loading, error, refetch, startPolling, stopPolling } =
    useQuery<JobChatMessagesQueryResponse>(JOB_CHAT_MESSAGES_QUERY, {
      variables: { jobId },
    });

  return {
    messages: data?.jobChatMessages ?? [],
    loading,
    error,
    refetch,
    startPolling,
    stopPolling,
  };
}
