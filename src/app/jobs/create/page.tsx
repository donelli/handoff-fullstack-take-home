"use client";

import { useRef, useState } from "react";
import { DetailsPageLayout } from "~/components/shared/DetailsPageLayout";
import { TextArea } from "~/foundation/text-area";
import { TextBox } from "~/foundation/text-box";
import { NumberInput } from "~/foundation/number-input";
import { gql } from "graphql-tag";
import { useMutation } from "@apollo/client";
import { useToast } from "~/foundation/hooks/useToast";
import { useRouter } from "next/navigation";

const QUERY = gql`
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
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [cost, setCost] = useState<number | "">("");
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [createJob, { loading }] =
    useMutation<CreateJobMutationResponse>(QUERY);
  const { showErrorToast } = useToast();

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = await createJob({
      variables: {
        input: { description, location, cost, homeownerIds: [2] },
      },
    });

    const id = result.data?.createJob.data?.id;

    if (id) {
      router.push(`/jobs/${id}`);
    } else {
      showErrorToast("An unexpected error ocurred!");
    }
  };

  return (
    <DetailsPageLayout
      title="Create new Job"
      footerAction={{
        label: "Create",
        onClick: () => formRef?.current?.requestSubmit(),
        loading,
      }}
    >
      <form ref={formRef} onSubmit={handleCreate}>
        <TextArea
          value={description}
          onChange={setDescription}
          placeholder="Enter job description"
          label="Description"
          rows={6}
          required
          readonly={loading}
        />
        <TextBox
          value={location}
          onChange={setLocation}
          placeholder="Enter job location"
          label="Location"
          required
          readonly={loading}
        />
        <NumberInput
          value={cost}
          onChange={setCost}
          placeholder="Enter job cost"
          label="Cost"
          min={0}
          step={0.01}
          required
          readonly={loading}
        />
      </form>
    </DetailsPageLayout>
  );
}
