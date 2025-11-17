"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { DetailsPageLayout } from "~/foundation/DetailsPageLayout";
import {
  JobForm,
  type JobFormRef,
  type JobFormData,
} from "~/components/shared/JobForm";
import { useToast } from "~/foundation/hooks/useToast";
import { useCreateJob } from "~/hooks/api";

export default function CreateJobPage() {
  const formRef = useRef<JobFormRef>(null);
  const router = useRouter();
  const { showErrorToast } = useToast();
  const { createJob, loading } = useCreateJob();

  const handleSubmit = async (data: JobFormData) => {
    try {
      const result = await createJob(data);

      if (result?.id) {
        router.replace(`/jobs/${result.id}`);
      } else {
        showErrorToast("An unexpected error occurred!");
      }
    } catch (error) {
      console.error(error);
      showErrorToast("Failed to create job");
    }
  };

  return (
    <DetailsPageLayout
      title="Create new Job"
      footerAction={{
        label: "Create",
        onClick: () => formRef.current?.submit(),
        loading,
      }}
    >
      <JobForm ref={formRef} onSubmit={handleSubmit} loading={loading} />
    </DetailsPageLayout>
  );
}
