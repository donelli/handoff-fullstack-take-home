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
import { useApolloClient } from "@apollo/client";
import Link from "next/link";
import styles from "./ContractorHome.module.css";
import { Button } from "~/foundation/Button";
import { type JobStatus } from "~/models/job";
import { useRouter } from "next/navigation";
import { JobStatusBadge } from "~/components/shared/JobStatusBadge";
import { useUserContext } from "~/hooks/useUserContext";
import { MdAdd } from "react-icons/md";
import { loadJobs, type JobListItem } from "~/hooks/api";

ModuleRegistry.registerModules([AllCommunityModule]);

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
            const result = await loadJobs(apolloClient, { page, limit });

            params.successCallback(result.jobs, result.pagination.total);

            // Show no rows overlay if there are no jobs
            if (result.pagination.total === 0 && gridRef.current?.api) {
              gridRef.current.api.showNoRowsOverlay();
            } else if (result.pagination.total > 0 && gridRef.current?.api) {
              gridRef.current.api.hideOverlay();
            }
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

  const colDefs = useMemo<ColDef<JobListItem>[]>(
    () => [
      { field: "id", headerName: "#", resizable: false, flex: 0.3 },
      {
        field: "description",
        headerName: "Description",
        cellRenderer: (params: ValueFormatterParams<JobListItem, string>) => (
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
        cellRenderer: (params: ValueFormatterParams<JobListItem, JobStatus>) =>
          params.value ? <JobStatusBadge status={params.value} /> : "-",
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
          overlayNoRowsTemplate="<span>No jobs found</span>"
        />
      </div>
    </main>
  );
};
