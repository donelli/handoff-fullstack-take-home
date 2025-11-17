import { useQuery, gql, type ApolloClient } from "@apollo/client";
import type { JobStatus } from "~/models/job";

export const LOAD_JOBS_QUERY = gql`
  query LoadJobs($page: Int, $limit: Int, $status: [JobStatus!]) {
    jobs(filter: { page: $page, limit: $limit, status: $status }) {
      page
      limit
      total
      data {
        id
        description
        location
        cost
        status
        createdAt
        updatedAt
      }
    }
  }
`;

export type JobListItem = {
  id: number;
  description: string;
  location: string;
  cost: number;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
};

export type LoadJobsResponse = {
  jobs: {
    page: number;
    limit: number;
    total: number;
    data: JobListItem[];
  };
};

export type JobsFilter = {
  page?: number;
  limit?: number;
  status?: JobStatus[];
};

export function useJobs(filter: JobsFilter = {}) {
  const { data, loading, error, refetch } = useQuery<LoadJobsResponse>(
    LOAD_JOBS_QUERY,
    {
      variables: {
        page: filter.page,
        limit: filter.limit,
        status: filter.status,
      },
    },
  );

  return {
    jobs: data?.jobs.data ?? [],
    pagination: data?.jobs
      ? {
          page: data.jobs.page,
          limit: data.jobs.limit,
          total: data.jobs.total,
        }
      : undefined,
    loading,
    error,
    refetch,
  };
}

export async function loadJobs(
  client: ApolloClient<unknown>,
  filter: JobsFilter = {},
): Promise<{ jobs: JobListItem[]; pagination: LoadJobsResponse["jobs"] }> {
  const result = await client.query<LoadJobsResponse>({
    query: LOAD_JOBS_QUERY,
    variables: {
      page: filter.page,
      limit: filter.limit,
      status: filter.status,
    },
  });

  return {
    jobs: result.data?.jobs.data ?? [],
    pagination: result.data?.jobs ?? {
      page: 0,
      limit: 0,
      total: 0,
      data: [],
    },
  };
}
