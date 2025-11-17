import { useMutation, gql } from "@apollo/client";
import type { JobChatMessage } from "./useJobChatMessages";

const CREATE_JOB_CHAT_MESSAGE_MUTATION = gql`
  mutation CreateJobChatMessage($input: CreateJobChatMessageInput!) {
    createJobChatMessage(input: $input) {
      data {
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
  }
`;

export type CreateJobChatMessageInput = {
  content: string;
  jobId: number;
};

export type CreateJobChatMessageMutationResponse = {
  createJobChatMessage: {
    data: JobChatMessage;
  };
};

export function useCreateJobChatMessage() {
  const [createMessageMutation, { loading, error }] =
    useMutation<CreateJobChatMessageMutationResponse>(
      CREATE_JOB_CHAT_MESSAGE_MUTATION,
    );

  const createMessage = async (input: CreateJobChatMessageInput) => {
    const result = await createMessageMutation({
      variables: { input },
    });

    return result.data?.createJobChatMessage.data;
  };

  return {
    createMessage,
    loading,
    error,
  };
}
