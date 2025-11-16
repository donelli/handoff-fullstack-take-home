import { AgGridReact } from "ag-grid-react";
import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type ColDef,
  type ValueFormatterParams,
  type IDatasource,
  type IGetRowsParams,
} from "ag-grid-community";
import { useApolloClient, gql } from "@apollo/client";
import Link from "next/link";
import styles from "./ContractorHome.module.css";
import { Button } from "~/foundation/button";
import { type JobStatus } from "~/models/job";
import { useRouter } from "next/navigation";
import { JobStatusBadge } from "../shared/JobStatusBadge";
import { useUserContext } from "~/hooks/useUserContext";
import { MdAdd } from "react-icons/md";

ModuleRegistry.registerModules([AllCommunityModule]);

const LOAD_JOBS_QUERY = gql`
  query LoadJobs($page: Int, $limit: Int) {
    jobs(filter: { page: $page, limit: $limit }) {
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

type LoadJobsJobModel = {
  id: number;
  description: string;
  location: string;
  cost: number;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
};

type LoadJobsQuery = {
  jobs: {
    page: number;
    limit: number;
    total: number;
    data: LoadJobsJobModel[];
  };
};

export const ContractorHome = () => {
  const router = useRouter();
  const [paginationPageSize, setPaginationPageSize] = useState(10);
  const gridRef = useRef<AgGridReact>(null);
  const pageSizeRef = useRef(paginationPageSize);
  const isUpdatingPageSizeRef = useRef(false);
  const apolloClient = useApolloClient();

  const { formatDate, formatCurrency } = useUserContext();

  useEffect(() => {
    pageSizeRef.current = paginationPageSize;
    isUpdatingPageSizeRef.current = false;
  }, [paginationPageSize]);

  const datasource = useMemo<IDatasource>(() => {
    return {
      getRows: (params: IGetRowsParams) => {
        const pageSize = pageSizeRef.current;
        const page = Math.floor(params.startRow / pageSize) + 1;
        const limit = pageSize;

        void (async () => {
          try {
            const result = await apolloClient.query<LoadJobsQuery>({
              query: LOAD_JOBS_QUERY,
              variables: { page, limit },
              fetchPolicy: "network-only",
            });

            const jobs = result.data?.jobs?.data ?? [];
            const total = result.data?.jobs?.total ?? 0;

            params.successCallback(jobs, total);
          } catch {
            params.failCallback();
          }
        })();
      },
    };
  }, [apolloClient]);

  const onGridReady = useCallback(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.setGridOption("datasource", datasource);
    }
  }, [datasource]);

  const onPaginationChanged = useCallback(() => {
    if (gridRef.current?.api && !isUpdatingPageSizeRef.current) {
      const api = gridRef.current.api;
      const newPageSize = api.paginationGetPageSize();

      if (newPageSize !== paginationPageSize) {
        isUpdatingPageSizeRef.current = true;
        setPaginationPageSize(newPageSize);
      }
    }
  }, [paginationPageSize]);

  const colDefs = useMemo<ColDef<LoadJobsJobModel>[]>(
    () => [
      { field: "id", headerName: "#", resizable: false, flex: 0.3 },
      {
        field: "description",
        headerName: "Description",
        cellRenderer: (
          params: ValueFormatterParams<LoadJobsJobModel, string>,
        ) => (
          <Link
            href={`/jobs/${params.data?.id ?? ""}`}
            className={styles.jobLink}
          >
            {params.value}
          </Link>
        ),
      },
      { field: "location", headerName: "Location" },
      {
        field: "status",
        headerName: "Status",
        cellRenderer: (
          params: ValueFormatterParams<LoadJobsJobModel, JobStatus>,
        ) => (params.value ? <JobStatusBadge status={params.value} /> : "-"),
      },
      {
        field: "cost",
        headerName: "Cost",
        valueFormatter: (params) => formatCurrency(params.value),
      },

      {
        field: "updatedAt",
        headerName: "Updated At",
        valueFormatter: (params) => formatDate(params.value),
      },
      {
        field: "createdAt",
        headerName: "Created At",
        valueFormatter: (params) => formatDate(params.value),
      },
    ],
    [formatDate, formatCurrency],
  );

  const defaultColDef = {
    flex: 1,
    sortable: false,
    filter: false,
  };

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>Jobs List</h1>
        <Button
          variant="primary"
          onClick={() => {
            router.push("/jobs/create");
          }}
        >
          <MdAdd size={16} /> Create Job
        </Button>
      </div>

      <div className={styles.tableContainer}>
        <AgGridReact
          ref={gridRef}
          rowModelType="infinite"
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          pagination
          paginationPageSize={paginationPageSize}
          paginationPageSizeSelector={[2, 10, 20, 50, 100]}
          cacheBlockSize={paginationPageSize}
          maxBlocksInCache={10}
          infiniteInitialRowCount={1}
          onGridReady={onGridReady}
          onPaginationChanged={onPaginationChanged}
        />
      </div>
    </main>
  );
};
