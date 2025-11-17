"use client";

import { useParams, useRouter } from "next/navigation";
import { DetailsPageLayout } from "~/foundation/DetailsPageLayout";
import { InfoField } from "~/foundation/InfoField";
import { JobChat } from "~/components/shared/JobChat";
import { useUserContext } from "~/hooks/useUserContext";
import { JobStatus } from "~/models/job";
import { Spinner } from "~/foundation/Spinner";
import { useToast } from "~/foundation/hooks/useToast";
import { UserType } from "~/models/user";
import { HomeownersList } from "~/components/shared/HomeownersList";
import { StatusToggle } from "~/foundation/StatusToggle";
import { ConfirmationDialog } from "~/foundation/ConfirmationDialog";
import { Button } from "~/foundation/Button";
import { useMemo, useState } from "react";
import {
  MdCheckCircleOutline,
  MdOutlineBlock,
  MdOutlineBuildCircle,
  MdOutlineFilterTiltShift,
  MdDeleteOutline,
  MdModeEdit,
  MdPendingActions,
} from "react-icons/md";
import { useAuth } from "~/providers/auth-provider";
import { JobStatusBadge } from "~/components/shared/JobStatusBadge";
import styles from "./index.module.css";
import {
  useJob,
  useChangeJobStatus,
  useDeleteJob,
  useCompleteJobTask,
} from "~/hooks/api";
import type { JobTask } from "~/hooks/api/useJob";

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = Number(params.id);
  const { formatDate, formatCurrency } = useUserContext();
  const { showErrorToast, showSuccessToast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { changeJobStatus, loading: changeJobStatusLoading } =
    useChangeJobStatus();
  const { deleteJob, loading: deleteJobLoading } = useDeleteJob();
  const { user } = useAuth();
  const isContractor = user?.type === UserType.CONTRACTOR;

  const { job, loading, error, refetch } = useJob(jobId);

  const handleChangeJobStatus = async (status: JobStatus) => {
    try {
      const result = await changeJobStatus(jobId, status);

      if (result) {
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
      const result = await deleteJob(jobId);

      if (result) {
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

  if (!job) {
    return <NotFoundPage />;
  }

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

            {(!!job.startDate || !!job.endDate) && (
              <div className={styles.sideBySideFields}>
                <InfoField
                  label="Start Date"
                  value={formatDate(job.startDate)}
                />
                <InfoField label="End Date" value={formatDate(job.endDate)} />
              </div>
            )}

            {job.tasks && job.tasks.length > 0 && (
              <JobTasksList tasks={job.tasks} onTaskCompleted={refetch} />
            )}

            <div className={styles.sideBySideFields}>
              <InfoField label="Created At" value={formatDate(job.createdAt)} />

              {isContractor && (
                <InfoField
                  label="Created By"
                  value={<HomeownersList homeowners={[job.createdByUser]} />}
                />
              )}
            </div>

            <InfoField label="Updated At" value={formatDate(job.updatedAt)} />
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
        <p className={styles.notFoundParagraph}>
          The job you&apos;re looking for doesn&apos;t exist or you don&apos;t
          have permission to access it.
        </p>
      </div>
    </DetailsPageLayout>
  );
};

const JobTasksList = ({
  tasks,
  onTaskCompleted,
}: {
  tasks: JobTask[];
  onTaskCompleted: () => void;
}) => {
  const { formatCurrency, formatDate } = useUserContext();
  const { showErrorToast, showSuccessToast } = useToast();
  const { completeJobTask, loading: completeTaskLoading } =
    useCompleteJobTask();
  const { user } = useAuth();
  const isContractor = user?.type === UserType.CONTRACTOR;

  const { completedTasksCount, pendingTasksCount } = useMemo(() => {
    let completedTasksCount = 0;

    for (const task of tasks) {
      if (task.completedAt) {
        completedTasksCount++;
      }
    }

    return {
      completedTasksCount,
      pendingTasksCount: tasks.length - completedTasksCount,
    };
  }, [tasks]);

  const handleCompleteTask = async (taskId: number) => {
    try {
      const result = await completeJobTask(taskId);
      if (result) {
        showSuccessToast("Task completed successfully");
        onTaskCompleted();
      }
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to complete task");
    }
  };

  return (
    <InfoField
      label={`Tasks (${completedTasksCount} completed, ${pendingTasksCount} pending)`}
      noBackground
      value={
        <div className={styles.tasksList}>
          {tasks.map((task) => (
            <div className={styles.taskItem} key={task.id}>
              <div className={styles.taskItemHeader}>
                <div>{task.description}</div>

                {task.completedAt ? (
                  <span className={styles.taskItemCompleted}>
                    <MdCheckCircleOutline size={14} color="var(--green-500)" />
                    Completed
                  </span>
                ) : (
                  <div className={styles.taskItemPendingContainer}>
                    {isContractor ? (
                      <Button
                        onClick={() => handleCompleteTask(task.id)}
                        type="button"
                        variant="outline"
                        loading={completeTaskLoading}
                        size="small"
                      >
                        <MdCheckCircleOutline
                          size={14}
                          color="var(--green-500)"
                        />
                        Complete
                      </Button>
                    ) : (
                      <span className={styles.taskItemPendingContainer}>
                        <MdPendingActions size={14} color="var(--orange-500)" />
                        Pending
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className={styles.taskItemContent}>
                <InfoField label="Cost" value={formatCurrency(task.cost)} />
                {task.completedAt && (
                  <InfoField
                    label="Completed At"
                    value={formatDate(task.completedAt)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      }
    />
  );
};
