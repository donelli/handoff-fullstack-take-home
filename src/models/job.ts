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
  location: string;
  deletedAt?: Date | null;
  deletedByUserId?: number | null;
};
