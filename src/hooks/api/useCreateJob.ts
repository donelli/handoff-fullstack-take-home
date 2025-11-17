import { useMutation, gql } from "@apollo/client";

const CREATE_JOB_MUTATION = gql`
  mutation CreateJob($input: CreateJobInput!) {
    createJob(input: $input) {
      data {
        id
      }
    }
  }
`;

export type CreateJobInput = {
  description: string;
  location: string;
  cost: number;
  homeownerIds: number[];
};

export type CreateJobMutationResponse = {
  createJob: {
    data: {
      id: number;
    } | null;
  };
};

export function useCreateJob() {
  const [createJobMutation, { loading, error }] =
    useMutation<CreateJobMutationResponse>(CREATE_JOB_MUTATION);

  const createJob = async (input: CreateJobInput) => {
    const result = await createJobMutation({
      variables: { input },
    });

    return result.data?.createJob.data;
  };

  return {
    createJob,
    loading,
    error,
  };
}
