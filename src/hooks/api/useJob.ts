import { useQuery, gql } from "@apollo/client";
import type { JobStatus } from "~/models/job";
import type { User } from "~/models/user";

const JOB_QUERY = gql`
  query GetJob($id: Int!) {
    job(id: $id) {
      id
      description
      location
      cost
      status
      createdAt
      updatedAt
      createdByUser {
        id
        name
      }
      homeowners {
        id
        name
      }
    }
  }
`;

export type JobData = {
  id: number;
  description: string;
  location: string;
  cost: number;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  createdByUser: User;
  homeowners: User[];
};

export type JobQueryResponse = {
  job: JobData | null;
};

export function useJob(id: number, options?: { skip?: boolean }) {
  const { data, loading, error, refetch } = useQuery<JobQueryResponse>(
    JOB_QUERY,
    {
      variables: { id },
      skip: options?.skip,
    },
  );

  return {
    job: data?.job ?? null,
    loading,
    error,
    refetch,
  };
}
