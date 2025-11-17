import { useQuery, gql, type ApolloClient } from "@apollo/client";
import type { JobStatus } from "~/models/job";

export const LOAD_JOBS_QUERY = gql`
  query LoadJobs(
    $page: Int
    $limit: Int
    $status: [JobStatus!]
    $sortField: JobSortField
    $sortDirection: JobSortDirection
  ) {
    jobs(
      filter: {
        page: $page
        limit: $limit
        status: $status
        sortField: $sortField
        sortDirection: $sortDirection
      }
    ) {
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
        startDate
        endDate
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
  startDate?: string | null;
  endDate?: string | null;
};

export type LoadJobsResponse = {
  jobs: {
    page: number;
    limit: number;
    total: number;
    data: JobListItem[];
  };
};

export type LoadJobsFilter = {
  page?: number;
  limit?: number;
  status?: JobStatus[];
  sortField?: LoadJobsSortField;
  sortDirection?: LoadJobsSortDirection;
};

export type LoadJobsSortField =
  | "startDate"
  | "endDate"
  | "updatedAt"
  | "createdAt"
  | "status";
export type LoadJobsSortDirection = "asc" | "desc";

function getApiSortField(sortField: LoadJobsSortField) {
  switch (sortField) {
    case "startDate":
      return "START_DATE";
    case "endDate":
      return "END_DATE";
    case "updatedAt":
      return "UPDATED_AT";
    case "createdAt":
      return "CREATED_AT";
    case "status":
      return "STATUS";
  }
}

function getApiSortDirection(sortDirection: LoadJobsSortDirection) {
  switch (sortDirection) {
    case "asc":
      return "ASC";
    case "desc":
      return "DESC";
  }
}

export function useJobs(filter: LoadJobsFilter = {}) {
  const { data, loading, error, refetch } = useQuery<LoadJobsResponse>(
    LOAD_JOBS_QUERY,
    {
      variables: {
        page: filter.page,
        limit: filter.limit,
        status: filter.status,
        sortField: getApiSortField(filter.sortField ?? "createdAt"),
        sortDirection: getApiSortDirection(filter.sortDirection ?? "asc"),
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
  filter: LoadJobsFilter = {},
): Promise<{ jobs: JobListItem[]; pagination: LoadJobsResponse["jobs"] }> {
  const result = await client.query<LoadJobsResponse>({
    query: LOAD_JOBS_QUERY,
    variables: {
      page: filter.page,
      limit: filter.limit,
      status: filter.status,
      sortField: getApiSortField(filter.sortField ?? "createdAt"),
      sortDirection: getApiSortDirection(filter.sortDirection ?? "asc"),
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
