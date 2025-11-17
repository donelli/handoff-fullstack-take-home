import { useQuery, gql } from "@apollo/client";
import type { User } from "~/models/user";

const JOB_QUERY = gql`
  query GetJobForEdit($id: Int!) {
    job(id: $id) {
      id
      description
      location
      cost
      startDate
      endDate
      tasks {
        id
        description
        cost
      }
      homeowners {
        id
        name
      }
    }
  }
`;

export type JobForEditData = {
  id: number;
  description: string;
  location: string;
  cost: number;
  homeowners: User[];
};

export type JobForEditQueryResponse = {
  job: JobForEditData | null;
};

export function useJobForEdit(id: number) {
  const { data, loading, error } = useQuery<JobForEditQueryResponse>(
    JOB_QUERY,
    {
      variables: { id },
    },
  );

  return {
    job: data?.job ?? null,
    loading,
    error,
  };
}
