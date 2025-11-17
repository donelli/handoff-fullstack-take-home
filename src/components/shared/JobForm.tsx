"use client";

import {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { TextArea } from "~/foundation/TextArea";
import { TextBox } from "~/foundation/TextBox";
import { NumberInput } from "~/foundation/NumberInput";
import {
  Autocomplete,
  type AutocompleteOption,
} from "~/foundation/Autocomplete";
import { useUsers } from "~/hooks/api";
import type { User } from "~/models/user";
import { DateInput } from "~/foundation/DateInput";
import styles from "./JobForm.module.css";

export type JobFormData = {
  description: string;
  location: string;
  cost: number;
  homeownerIds: number[];
  startDate: string | null;
  endDate: string | null;
};

type JobData = {
  id: number;
  description: string;
  location: string;
  cost: number;
  homeowners: User[];
  startDate: string | null;
  endDate: string | null;
};

type JobFormProps = {
  job?: JobData | null;
  onSubmit: (data: JobFormData) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
};

export type JobFormRef = {
  submit: () => void;
};

export const JobForm = forwardRef<JobFormRef, JobFormProps>(
  ({ job, onSubmit, loading = false, disabled = false }, ref) => {
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [cost, setCost] = useState<number | "">("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const { homeowners, loading: isLoadingUsers } = useUsers();
    const [selectedHomeowners, setSelectedHomeowners] = useState<
      AutocompleteOption<User>[]
    >([]);

    useImperativeHandle(ref, () => ({
      submit: () => {
        formRef.current?.requestSubmit();
      },
    }));

    useEffect(() => {
      if (job) {
        setDescription(job.description);
        setLocation(job.location);
        setCost(job.cost);
        setSelectedHomeowners(
          job.homeowners.map((homeowner) => ({
            id: homeowner.id,
            label: homeowner.name,
            data: homeowner,
          })),
        );
        setStartDate(job.startDate ? new Date(job.startDate) : null);
        setEndDate(job.endDate ? new Date(job.endDate) : null);
      }
    }, [job]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const homeownerIds = selectedHomeowners.map((homeowner) => homeowner.id);
      const formData: JobFormData = {
        description,
        location,
        cost: typeof cost === "number" ? cost : 0,
        homeownerIds,
        startDate: startDate?.toISOString() ?? null,
        endDate: endDate?.toISOString() ?? null,
      };

      await onSubmit(formData);
    };

    const isFormDisabled = disabled || loading;

    return (
      <form ref={formRef} onSubmit={handleSubmit}>
        <TextArea
          value={description}
          onChange={setDescription}
          placeholder="Enter job description"
          label="Description"
          rows={6}
          required
          readonly={isFormDisabled}
        />
        <TextBox
          value={location}
          onChange={setLocation}
          placeholder="Enter job location"
          label="Location"
          required
          readonly={isFormDisabled}
        />
        <NumberInput
          value={cost}
          onChange={setCost}
          placeholder="Enter job cost"
          label="Cost"
          min={0}
          step={0.01}
          required
          readonly={isFormDisabled}
          prefix="$"
        />

        <div className={styles.dateInputs}>
          <DateInput
            value={startDate}
            onChange={setStartDate}
            placeholder="Enter job start date"
            label="Start Date"
            readonly={isFormDisabled}
            maxDate={endDate}
          />
          <DateInput
            value={endDate}
            onChange={setEndDate}
            placeholder="Enter job end date"
            label="End Date"
            readonly={isFormDisabled}
            minDate={startDate}
          />
        </div>

        <Autocomplete
          options={homeowners.map((homeowner) => ({
            id: homeowner.id,
            label: homeowner.name,
            data: homeowner,
          }))}
          selectedOptions={selectedHomeowners}
          onChange={(selected) => {
            setSelectedHomeowners(selected);
          }}
          placeholder="Select homeowners"
          label="Homeowners"
          disabled={isFormDisabled || isLoadingUsers}
          loading={isLoadingUsers}
        />
      </form>
    );
  },
);

JobForm.displayName = "JobForm";
