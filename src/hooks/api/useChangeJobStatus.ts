import { useMutation, gql } from "@apollo/client";
import type { JobStatus } from "~/models/job";

const CHANGE_JOB_STATUS_MUTATION = gql`
  mutation ChangeJobStatus($id: Int!, $status: JobStatus!) {
    changeJobStatus(id: $id, status: $status) {
      data {
        id
      }
    }
  }
`;

export type ChangeJobStatusMutationResponse = {
  changeJobStatus: {
    data: {
      id: number;
    };
  };
};

export function useChangeJobStatus() {
  const [changeJobStatusMutation, { loading, error }] =
    useMutation<ChangeJobStatusMutationResponse>(CHANGE_JOB_STATUS_MUTATION);

  const changeJobStatus = async (id: number, status: JobStatus) => {
    const result = await changeJobStatusMutation({
      variables: { id, status },
    });

    return result.data?.changeJobStatus.data;
  };

  return {
    changeJobStatus,
    loading,
    error,
  };
}
