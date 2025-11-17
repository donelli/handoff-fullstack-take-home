"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { gql, useMutation } from "@apollo/client";
import { DetailsPageLayout } from "~/components/shared/DetailsPageLayout";
import {
  JobForm,
  type JobFormRef,
  type JobFormData,
} from "~/components/shared/JobForm";
import { useToast } from "~/foundation/hooks/useToast";

const CREATE_JOB_MUTATION = gql`
  mutation CreateJob($input: CreateJobInput!) {
    createJob(input: $input) {
      data {
        id
      }
    }
  }
`;

type CreateJobMutationResponse = {
  createJob: {
    data: {
      id: number;
    };
  };
};

export default function CreateJobPage() {
  const formRef = useRef<JobFormRef>(null);
  const router = useRouter();
  const { showErrorToast } = useToast();
  const [createJob, { loading }] =
    useMutation<CreateJobMutationResponse>(CREATE_JOB_MUTATION);

  const handleSubmit = async (data: JobFormData) => {
    try {
      const result = await createJob({
        variables: {
          input: data,
        },
      });

      const id = result.data?.createJob.data?.id;

      if (id) {
        router.replace(`/jobs/${id}`);
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
