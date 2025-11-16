"use client";

import { useParams, useRouter } from "next/navigation";
import { DetailsPageLayout } from "~/components/shared/DetailsPageLayout";
import { InfoField } from "~/foundation/info-field";
import { Chat } from "~/components/shared/Chat";
import { useQuery, gql, useMutation } from "@apollo/client";
import { useUserContext } from "~/hooks/useUserContext";
import { JobStatus } from "~/models/job";
import { Spinner } from "~/foundation/spinner";
import { useToast } from "~/foundation/hooks/useToast";
import { type User } from "~/models/user";
import { HomeownersList } from "~/components/shared/HomeownersList";
import { StatusToggle } from "~/foundation/StatusToggle";
import { ConfirmationDialog } from "~/foundation/ConfirmationDialog";
import { Button } from "~/foundation/button";
import { useState } from "react";
import {
  MdCheckCircleOutline,
  MdOutlineBlock,
  MdOutlineBuildCircle,
  MdOutlineFilterTiltShift,
  MdDeleteOutline,
} from "react-icons/md";

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
        <div
          style={{ display: "flex", justifyContent: "center", padding: "2rem" }}
        >
          <Spinner />
        </div>
      </DetailsPageLayout>
    );
  }

  if (error) {
    return (
      <DetailsPageLayout title="Job Details">
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            backgroundColor: "#fee",
            border: "1px solid #fcc",
            borderRadius: "8px",
            color: "#c33",
          }}
        >
          <h2 style={{ marginBottom: "1rem", fontSize: "1.5rem" }}>
            Error Loading Job
          </h2>
          <p style={{ margin: 0 }}>
            An error occurred while loading the job details. Please try again
            later.
          </p>
        </div>
      </DetailsPageLayout>
    );
  }

  if (!data?.job) {
    return (
      <DetailsPageLayout title="Job Details">
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            backgroundColor: "#f9f9f9",
            border: "1px solid #ddd",
            borderRadius: "8px",
            color: "#666",
          }}
        >
          <h2 style={{ marginBottom: "1rem", fontSize: "1.5rem" }}>
            Job Not Found
          </h2>
          <p style={{ margin: 0 }}>
            The job you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
        </div>
      </DetailsPageLayout>
    );
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
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            type="button"
            variant="danger"
          >
            <MdDeleteOutline size={16} />
            Delete
          </Button>
        }
      >
        <div
          style={{ display: "flex", gap: "var(--spacing-lg)", height: "100%" }}
        >
          <div style={{ flex: "1 1 70%" }}>
            <InfoField
              label="Status"
              noBackground
              value={
                <StatusToggle
                  loading={changeJobStatusLoading}
                  value={job.status}
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
              }
            />

            <InfoField label="Description" value={job.description} />

            <InfoField label="Location" value={job.location} />

            <InfoField label="Cost" value={formatCurrency(job.cost)} />

            {job.homeowners && job.homeowners.length > 0 && (
              <InfoField
                label="Homeowners"
                value={<HomeownersList homeowners={job.homeowners} />}
              />
            )}

            <InfoField label="Updated At" value={formatDate(job.updatedAt)} />

            <InfoField
              label="Created By"
              value={<HomeownersList homeowners={[job.createdByUser]} />}
            />

            <InfoField label="Created At" value={formatDate(job.createdAt)} />
          </div>
          <div style={{ flex: "0 0 40%", height: "100%" }}>
            <Chat />
          </div>
        </div>
      </DetailsPageLayout>
    </>
  );
}
