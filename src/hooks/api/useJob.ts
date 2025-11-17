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
      startDate
      endDate
      createdAt
      updatedAt
      tasks {
        id
        description
        cost
        completedAt
      }
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

export type JobTask = {
  id: number;
  description: string;
  cost: number;
  completedAt: string | null;
};

export type JobData = {
  id: number;
  description: string;
  location: string;
  cost: number;
  status: JobStatus;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
  createdByUser: User;
  homeowners: User[];
  tasks: JobTask[];
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
