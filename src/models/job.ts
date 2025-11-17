export enum JobStatus {
  PLANNING = "PLANNING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
}

export type JobModel = {
  id: number;
  description: string;
  createdByUserId: number;
  cost: number;
  status: JobStatus;
  location: string;
  deletedAt?: string | null;
  deletedByUserId?: number | null;
  createdAt: string;
  updatedAt: string;
  startDate?: string | null;
  endDate?: string | null;
};
