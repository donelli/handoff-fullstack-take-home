"use client";

import { useParams, useRouter } from "next/navigation";
import { useRef } from "react";
import { DetailsPageLayout } from "~/components/shared/DetailsPageLayout";
import {
  JobForm,
  type JobFormRef,
  type JobFormData,
} from "~/components/shared/JobForm";
import { Spinner } from "~/foundation/Spinner";
import { useToast } from "~/foundation/hooks/useToast";
import { useJobForEdit, useUpdateJob } from "~/hooks/api";

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = Number(params.id);
  const formRef = useRef<JobFormRef>(null);
  const { showErrorToast } = useToast();
  const { updateJob, loading } = useUpdateJob();

  const { job, loading: isLoadingJob, error } = useJobForEdit(jobId);

  if (isLoadingJob) {
    return (
      <DetailsPageLayout title="Edit Job">
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
      <DetailsPageLayout title="Edit Job">
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

  if (!job) {
    return (
      <DetailsPageLayout title="Edit Job">
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

  const handleSubmit = async (formData: JobFormData) => {
    try {
      const result = await updateJob(jobId, formData);

      if (result?.id) {
        router.replace(`/jobs/${result.id}`);
      } else {
        showErrorToast("An unexpected error occurred!");
      }
    } catch (error) {
      console.error(error);
      showErrorToast("Failed to update job");
    }
  };

  return (
    <DetailsPageLayout
      title="Edit Job"
      footerAction={{
        label: "Save",
        onClick: () => formRef.current?.submit(),
        loading,
      }}
    >
      <JobForm
        ref={formRef}
        job={job}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </DetailsPageLayout>
  );
}
