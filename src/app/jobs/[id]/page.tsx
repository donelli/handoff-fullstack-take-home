"use client";

import { useParams, useRouter } from "next/navigation";
import { DetailsPageLayout } from "~/components/shared/DetailsPageLayout";
import { InfoField } from "~/foundation/InfoField";
import { JobChat } from "~/components/shared/JobChat";
import { useQuery, gql, useMutation } from "@apollo/client";
import { useUserContext } from "~/hooks/useUserContext";
import { JobStatus } from "~/models/job";
import { Spinner } from "~/foundation/Spinner";
import { useToast } from "~/foundation/hooks/useToast";
import { UserType, type User } from "~/models/user";
import { HomeownersList } from "~/components/shared/HomeownersList";
import { StatusToggle } from "~/foundation/StatusToggle";
import { ConfirmationDialog } from "~/foundation/ConfirmationDialog";
import { Button } from "~/foundation/Button";
import { useState } from "react";
import {
  MdCheckCircleOutline,
  MdOutlineBlock,
  MdOutlineBuildCircle,
  MdOutlineFilterTiltShift,
  MdDeleteOutline,
  MdModeEdit,
} from "react-icons/md";
import { useAuth } from "~/providers/auth-provider";
import { JobStatusBadge } from "~/components/shared/JobStatusBadge";
import styles from "./index.module.css";

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

type JobData = {
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

type JobQueryResponse = {
  job: JobData | null;
};

const CHANGE_JOB_STATUS_MUTATION = gql`
  mutation ChangeJobStatus($id: Int!, $status: JobStatus!) {
    changeJobStatus(id: $id, status: $status) {
      data {
        id
      }
    }
  }
`;

type ChangeJobStatusMutationResponse = {
  changeJobStatus: {
    data: JobData;
  };
};

const DELETE_JOB_MUTATION = gql`
  mutation DeleteJob($id: Int!) {
    deleteJob(id: $id)
  }
`;

type DeleteJobMutationResponse = {
  deleteJob: boolean;
};

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = Number(params.id);
  const { formatDate, formatCurrency } = useUserContext();
  const { showErrorToast, showSuccessToast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [changeJobStatus, { loading: changeJobStatusLoading }] =
    useMutation<ChangeJobStatusMutationResponse>(CHANGE_JOB_STATUS_MUTATION);
  const [deleteJob, { loading: deleteJobLoading }] =
    useMutation<DeleteJobMutationResponse>(DELETE_JOB_MUTATION);
  const { user } = useAuth();
  const isContractor = user?.type === UserType.CONTRACTOR;

  const { data, loading, error, refetch } = useQuery<JobQueryResponse>(
    JOB_QUERY,
    {
      variables: { id: jobId },
      fetchPolicy: "network-only",
      onError: () => {
        showErrorToast("Failed to load job details");
      },
    },
  );

  const handleChangeJobStatus = async (status: JobStatus) => {
    try {
      const result = await changeJobStatus({
        variables: { id: jobId, status },
      });

      if (result.data?.changeJobStatus.data) {
        showSuccessToast("Job status changed successfully");
        void refetch();
      }
    } catch (error) {
      console.error(error);
      showErrorToast("Failed to change job status");
    }
  };

  const handleDeleteJob = async () => {
    try {
      const result = await deleteJob({
        variables: { id: jobId },
      });

      if (result.data?.deleteJob) {
        showSuccessToast("Job deleted successfully");
        router.push("/");
      }
    } catch (error) {
      console.error(error);
      showErrorToast("Failed to delete job");
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <DetailsPageLayout title="Job Details">
        <div className={styles.spinnerContainer}>
          <Spinner />
        </div>
      </DetailsPageLayout>
    );
  }

  if (error) {
    return <ErrorPage />;
  }

  if (!data?.job) {
    return <NotFoundPage />;
  }

  const job = data.job;

  return (
    <>
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Delete Job"
        message="Are you sure you want to delete this job? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteJob}
        onCancel={() => setShowDeleteConfirm(false)}
        loading={deleteJobLoading}
      />
      <DetailsPageLayout
        title="Job Details"
        headerAction={
          isContractor && (
            <div className={styles.headerActions}>
              <Button
                onClick={() => router.push(`/jobs/${jobId}/edit`)}
                type="button"
                variant="primary"
              >
                <MdModeEdit size={16} />
                Edit
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                type="button"
                variant="danger"
              >
                <MdDeleteOutline size={16} />
                Delete
              </Button>
            </div>
          )
        }
      >
        <div className={styles.mainContent}>
          <div className={styles.leftColumn}>
            <StatusField
              isContractor={isContractor}
              status={job.status}
              changeJobStatusLoading={changeJobStatusLoading}
              handleChangeJobStatus={handleChangeJobStatus}
            />

            <InfoField label="Description" value={job.description} />

            <InfoField label="Location" value={job.location} />

            <InfoField label="Cost" value={formatCurrency(job.cost)} />

            {isContractor && job.homeowners && job.homeowners.length > 0 && (
              <InfoField
                label="Homeowners"
                value={<HomeownersList homeowners={job.homeowners} />}
              />
            )}

            <InfoField label="Updated At" value={formatDate(job.updatedAt)} />

            {isContractor && (
              <InfoField
                label="Created By"
                value={<HomeownersList homeowners={[job.createdByUser]} />}
              />
            )}

            <InfoField label="Created At" value={formatDate(job.createdAt)} />
          </div>
          <div className={styles.rightColumn}>
            <JobChat jobId={jobId} />
          </div>
        </div>
      </DetailsPageLayout>
    </>
  );
}

const StatusField = ({
  isContractor,
  status,
  changeJobStatusLoading,
  handleChangeJobStatus,
}: {
  isContractor: boolean;
  status: JobStatus;
  changeJobStatusLoading: boolean;
  handleChangeJobStatus: (status: JobStatus) => void;
}) => {
  return (
    <InfoField
      label="Status"
      noBackground={isContractor}
      value={
        isContractor ? (
          <StatusToggle
            loading={changeJobStatusLoading}
            value={status}
            onChange={handleChangeJobStatus}
            options={[
              {
                label: "Planning",
                value: JobStatus.PLANNING,
                icon: (color: string) => (
                  <MdOutlineFilterTiltShift color={color} size={16} />
                ),
                color: "var(--orange-500)",
                selectedBackgroundColor: "var(--orange-100)",
              },
              {
                label: "In Progress",
                value: JobStatus.IN_PROGRESS,
                icon: (color: string) => (
                  <MdOutlineBuildCircle color={color} size={16} />
                ),
                color: "var(--blue-500)",
                selectedBackgroundColor: "var(--blue-100)",
              },
              {
                label: "Completed",
                value: JobStatus.COMPLETED,
                icon: (color: string) => (
                  <MdCheckCircleOutline color={color} size={16} />
                ),
                color: "var(--green-500)",
                selectedBackgroundColor: "var(--green-100)",
              },
              {
                label: "Canceled",
                value: JobStatus.CANCELED,
                icon: (color: string) => (
                  <MdOutlineBlock color={color} size={16} />
                ),
                color: "var(--red-500)",
                selectedBackgroundColor: "var(--red-100)",
              },
            ]}
          />
        ) : (
          <JobStatusBadge status={status} />
        )
      }
    />
  );
};

const ErrorPage = () => {
  return (
    <DetailsPageLayout title="Job Details">
      <div className={styles.errorContainer}>
        <h2 className={styles.errorHeading}>Error Loading Job</h2>
        <p className={styles.errorParagraph}>
          An error occurred while loading the job details. Please try again
          later.
        </p>
      </div>
    </DetailsPageLayout>
  );
};

const NotFoundPage = () => {
  return (
    <DetailsPageLayout title="Job Details">
      <div className={styles.notFoundContainer}>
        <h2 className={styles.notFoundHeading}>Job Not Found</h2>
      </div>
      <p className={styles.notFoundParagraph}>
        The job you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
    </DetailsPageLayout>
  );
};
