import { useMutation, gql } from "@apollo/client";

const DELETE_JOB_MUTATION = gql`
  mutation DeleteJob($id: Int!) {
    deleteJob(id: $id)
  }
`;

export type DeleteJobMutationResponse = {
  deleteJob: boolean;
};

export function useDeleteJob() {
  const [deleteJobMutation, { loading, error }] =
    useMutation<DeleteJobMutationResponse>(DELETE_JOB_MUTATION);

  const deleteJob = async (id: number) => {
    const result = await deleteJobMutation({
      variables: { id },
    });

    return result.data?.deleteJob ?? false;
  };

  return {
    deleteJob,
    loading,
    error,
  };
}
