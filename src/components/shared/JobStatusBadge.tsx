import { JobStatus } from "~/models/job";
import {
  MdCheckCircleOutline,
  MdOutlineBlock,
  MdOutlineBuildCircle,
  MdOutlineFilterTiltShift,
} from "react-icons/md";
import styles from "./JobStatusBadge.module.css";

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const statusText = {
    [JobStatus.PLANNING]: "Planning",
    [JobStatus.IN_PROGRESS]: "In Progress",
    [JobStatus.COMPLETED]: "Completed",
    [JobStatus.CANCELED]: "Canceled",
  };

  const statusIcon = {
    [JobStatus.PLANNING]: (
      <MdOutlineFilterTiltShift color="var(--blue-500)" size={16} />
    ),
    [JobStatus.IN_PROGRESS]: (
      <MdOutlineBuildCircle color="var(--green-500)" size={16} />
    ),
    [JobStatus.COMPLETED]: (
      <MdCheckCircleOutline color="var(--green-500)" size={16} />
    ),
    [JobStatus.CANCELED]: <MdOutlineBlock color="var(--red-500)" size={16} />,
  };

  return (
    <div className={styles.container}>
      {statusIcon[status]} {statusText[status]}
    </div>
  );
}
