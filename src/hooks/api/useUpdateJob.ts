import { useMutation, gql } from "@apollo/client";

const UPDATE_JOB_MUTATION = gql`
  mutation UpdateJob($id: Int!, $input: UpdateJobInput!) {
    updateJob(id: $id, input: $input) {
      data {
        id
      }
    }
  }
`;

export type UpdateJobInput = {
  description?: string;
  location?: string;
  cost?: number;
  homeownerIds?: number[];
};

export type UpdateJobMutationResponse = {
  updateJob: {
    data: {
      id: number;
    } | null;
  };
};

export function useUpdateJob() {
  const [updateJobMutation, { loading, error }] =
    useMutation<UpdateJobMutationResponse>(UPDATE_JOB_MUTATION);

  const updateJob = async (id: number, input: UpdateJobInput) => {
    const result = await updateJobMutation({
      variables: { id, input },
    });

    return result.data?.updateJob.data;
  };

  return {
    updateJob,
    loading,
    error,
  };
}
