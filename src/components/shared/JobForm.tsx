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
import { Button } from "~/foundation/Button";
import styles from "./JobForm.module.css";
import { Divider } from "~/foundation/Divider";

export type JobFormData = {
  description: string;
  location: string;
  cost: number;
  homeownerIds: number[];
  startDate: string | null;
  endDate: string | null;
  tasks: JobTaskData[];
};

export type JobTaskData = {
  id?: number | null;
  description: string;
  cost?: number | null;
  completedAt?: string | null;
  completedByUserId?: number | null;
};

type JobData = {
  id: number;
  description: string;
  location: string;
  cost: number;
  homeowners: User[];
  startDate: string | null;
  endDate: string | null;
  tasks?: JobTaskData[];
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
    const [tasks, setTasks] = useState<JobTaskData[]>([]);
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
        setTasks(
          job.tasks?.map((task) => ({
            id: task.id,
            description: task.description,
            cost: task.cost ?? null,
          })) ?? [],
        );
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
        tasks,
      };

      await onSubmit(formData);
    };

    const addTask = () => {
      setTasks([...tasks, { description: "", cost: null }]);
    };

    const removeTask = (index: number) => {
      setTasks(tasks.filter((_, i) => i !== index));
    };

    const updateTask = (
      index: number,
      field: keyof JobTaskData,
      value: string | number | null,
    ) => {
      const updatedTasks = [...tasks];
      const currentTask = updatedTasks[index];
      if (!currentTask) return;

      if (field === "description") {
        updatedTasks[index] = {
          id: currentTask.id,
          description: value as string,
          cost: currentTask.cost ?? null,
        };
      } else if (field === "cost") {
        updatedTasks[index] = {
          id: currentTask.id,
          description: currentTask.description,
          cost: value as number | null,
        };
      }
      setTasks(updatedTasks);
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

        <Divider />

        <div className={styles.tasksSection}>
          <div className={styles.tasksHeader}>
            <label className={styles.tasksLabel}>Tasks</label>
            <Button type="button" onClick={addTask} disabled={isFormDisabled}>
              Add New Task
            </Button>
          </div>
          {tasks.length > 0 && (
            <div className={styles.tasksList}>
              {tasks.map((task, index) => (
                <div key={index} className={styles.taskCard}>
                  <TextBox
                    value={task.description}
                    onChange={(value) =>
                      updateTask(index, "description", value)
                    }
                    placeholder="Enter task description"
                    label="Description"
                    required
                    readonly={isFormDisabled}
                  />
                  <NumberInput
                    value={task.cost ?? ""}
                    onChange={(value) => updateTask(index, "cost", value)}
                    placeholder="Enter task cost"
                    label="Cost"
                    min={0}
                    step={0.01}
                    readonly={isFormDisabled}
                    prefix="$"
                  />
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => removeTask(index)}
                    disabled={isFormDisabled}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    );
  },
);

JobForm.displayName = "JobForm";
