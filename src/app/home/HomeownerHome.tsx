"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useApolloClient } from "@apollo/client";
import Link from "next/link";
import styles from "./HomeownerHome.module.css";
import { Button } from "~/foundation/Button";
import { JobStatus } from "~/models/job";
import { JobStatusBadge } from "~/components/shared/JobStatusBadge";
import { useUserContext } from "~/hooks/useUserContext";
import { Spinner } from "~/foundation/Spinner";
import { loadJobs, type JobListItem } from "~/hooks/api";

type JobSectionProps = {
  title: string;
  statuses: JobStatus[];
  apolloClient: ReturnType<typeof useApolloClient>;
  formatDate: (date: unknown) => string;
  formatCurrency: (amount: unknown) => string;
};

const JobCard = ({
  job,
  formatDate,
  formatCurrency,
}: {
  job: JobListItem;
  formatDate: (date: unknown) => string;
  formatCurrency: (amount: unknown) => string;
}) => {
  return (
    <Link href={`/jobs/${job.id}`} className={styles.jobCard}>
      <div className={styles.jobCardHeader}>
        <h3 className={styles.jobCardTitle}>{job.description}</h3>
        <JobStatusBadge status={job.status} />
      </div>
      <div className={styles.jobCardContent}>
        <div className={styles.jobCardField}>
          <span className={styles.jobCardLabel}>Location:</span>
          <span
            className={`${styles.jobCardValue} ${styles.jobCardValueTruncate}`}
          >
            {job.location}
          </span>
        </div>
        <div className={styles.jobCardField}>
          <span className={styles.jobCardLabel}>Cost:</span>
          <span className={styles.jobCardValue}>
            {formatCurrency(job.cost)}
          </span>
        </div>
        <div className={styles.jobCardField}>
          <span className={styles.jobCardLabel}>Updated:</span>
          <span className={styles.jobCardValue}>
            {formatDate(job.updatedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
};

const JobSection = ({
  title,
  statuses,
  apolloClient,
  formatDate,
  formatCurrency,
}: JobSectionProps) => {
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadJobsForPage = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const result = await loadJobs(apolloClient, {
          page,
          limit: 10,
          status: statuses,
        });

        if (page === 1) {
          setJobs(result.jobs);
        } else {
          setJobs((prev) => [...prev, ...result.jobs]);
        }
        setTotal(result.pagination.total);
        setCurrentPage(page);
      } catch (error) {
        console.error("Failed to load jobs:", error);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [apolloClient, statuses],
  );

  const handleLoadMore = useCallback(() => {
    void loadJobsForPage(currentPage + 1);
  }, [currentPage, loadJobsForPage]);

  useEffect(() => {
    void loadJobsForPage(1);
  }, [loadJobsForPage]);

  const hasMore = jobs.length < total;

  if (initialLoading) {
    return (
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <div className={styles.loadingContainer}>
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {jobs.length === 0 ? (
        <div className={styles.emptyState}>No jobs found</div>
      ) : (
        <>
          <div className={styles.jobsGrid}>
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
          {hasMore && (
            <div className={styles.loadMoreContainer}>
              <Button onClick={handleLoadMore} loading={loading}>
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export const HomeownerHome = () => {
  const apolloClient = useApolloClient();
  const { formatDate, formatCurrency } = useUserContext();

  const inProgressStatuses = useMemo(() => [JobStatus.IN_PROGRESS], []);
  const planningStatuses = useMemo(() => [JobStatus.PLANNING], []);
  const finishedStatuses = useMemo(
    () => [JobStatus.COMPLETED, JobStatus.CANCELED],
    [],
  );

  return (
    <main className={styles.main}>
      <h1 className={styles.mainTitle}>My Jobs</h1>
      <JobSection
        title="Jobs in Progress"
        statuses={inProgressStatuses}
        apolloClient={apolloClient}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
      />
      <JobSection
        title="Jobs Being Planned"
        statuses={planningStatuses}
        apolloClient={apolloClient}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
      />
      <JobSection
        title="Finished or Canceled Jobs"
        statuses={finishedStatuses}
        apolloClient={apolloClient}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
      />
    </main>
  );
};

