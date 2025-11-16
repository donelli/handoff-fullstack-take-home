"use client";

import { useParams } from "next/navigation";
import { DetailsPageLayout } from "~/components/shared/DetailsPageLayout";
import { InfoField } from "~/foundation/info-field";
import { JobStatusBadge } from "~/components/shared/JobStatusBadge";
import { Chat } from "~/components/shared/Chat";
import { useQuery, gql } from "@apollo/client";
import { useUserContext } from "~/hooks/useUserContext";
import { type JobStatus } from "~/models/job";
import { Spinner } from "~/foundation/spinner";
import { useToast } from "~/foundation/hooks/useToast";

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
    }
  }
`;

type JobQueryResponse = {
  job: {
    id: number;
    description: string;
    location: string;
    cost: number;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    createdByUser: {
      id: number;
      name: string;
    };
  } | null;
};

export default function JobDetailsPage() {
  const params = useParams();
  const jobId = Number(params.id);
  const { formatDate, formatCurrency } = useUserContext();
  const { showErrorToast } = useToast();

  const { data, loading, error } = useQuery<JobQueryResponse>(JOB_QUERY, {
    variables: { id: jobId },
    fetchPolicy: "network-only",
    onError: () => {
      showErrorToast("Failed to load job details");
    },
  });

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
    <DetailsPageLayout title="Job Details">
      <div
        style={{ display: "flex", gap: "var(--spacing-lg)", height: "100%" }}
      >
        <div style={{ flex: "1 1 70%" }}>
          <InfoField
            label="Status"
            value={<JobStatusBadge status={job.status} />}
          />

          <InfoField label="Description" value={job.description} />

          <InfoField label="Location" value={job.location} />

          <InfoField label="Cost" value={formatCurrency(job.cost)} />

          <InfoField label="Updated At" value={formatDate(job.updatedAt)} />

          <InfoField label="Created By" value={job.createdByUser.name} />

          <InfoField label="Created At" value={formatDate(job.createdAt)} />
        </div>
        <div style={{ flex: "0 0 40%", height: "100%" }}>
          <Chat />
        </div>
      </div>
    </DetailsPageLayout>
  );
}
