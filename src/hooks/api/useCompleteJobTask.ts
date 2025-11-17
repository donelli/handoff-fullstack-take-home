import { useMutation, gql } from "@apollo/client";

const COMPLETE_JOB_TASK_MUTATION = gql`
  mutation CompleteJobTask($id: Int!) {
    completeJobTask(id: $id) {
      data {
        id
        description
        cost
        completedAt
        completedByUserId
      }
    }
  }
`;

export type JobTask = {
  id: number;
  description: string;
  cost: number | null;
  completedAt: string | null;
  completedByUserId: number | null;
};

export type CompleteJobTaskMutationResponse = {
  completeJobTask: {
    data: JobTask;
  };
};

export function useCompleteJobTask() {
  const [completeJobTaskMutation, { loading, error }] =
    useMutation<CompleteJobTaskMutationResponse>(COMPLETE_JOB_TASK_MUTATION);

  const completeJobTask = async (id: number): Promise<JobTask | undefined> => {
    const result = await completeJobTaskMutation({
      variables: { id },
    });

    return result.data?.completeJobTask.data;
  };

  return {
    completeJobTask,
    loading,
    error,
  };
}
