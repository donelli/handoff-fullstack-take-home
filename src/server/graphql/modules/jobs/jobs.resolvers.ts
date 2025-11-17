import type { RequestContext } from "~/server/request_context";
import type {
  CreateJobPayload,
  JobsService,
  UpdateJobPayload,
} from "~/server/service/jobs/jobs.service";
import { adaptServiceCall } from "../../resolvers";
import type { JobStatus } from "~/models/job";
import type { DataLoaders } from "../../dataloaders";
import type { UsersService } from "~/server/service/users/users.service";
import type {
  LoadJobsSortDirection,
  LoadJobsSortField,
} from "~/server/repository/jobs/jobs.repository";

export const buildJobsResolvers = ({
  jobsService,
  dataLoaders,
  usersService,
}: {
  jobsService: JobsService;
  dataLoaders: DataLoaders;
  usersService: UsersService;
}) => {
  return {
    Query: {
      jobs: (
        _: unknown,
        { filter }: { filter: LoadJobsFilter },
        context: RequestContext,
      ) => {
        return adaptServiceCall(() =>
          jobsService.loadBasedOnUser({
            ...filter,
            context,
          }),
        );
      },
      job: (_: unknown, { id }: { id: number }, context: RequestContext) => {
        return adaptServiceCall(() =>
          jobsService.loadById({
            context,
            id,
          }),
        );
      },
    },
    Job: {
      createdByUser: (
        parent: { createdByUserId: number },
        _: unknown,
        context: RequestContext,
      ) => {
        return dataLoaders.users(context).load(parent.createdByUserId);
      },
      deletedByUser: (
        parent: { deletedByUserId?: number | null },
        _: unknown,
        context: RequestContext,
      ) => {
        if (!parent.deletedByUserId) {
          return null;
        }

        return dataLoaders.users(context).load(parent.deletedByUserId);
      },
      homeowners: (parent: { id: number }) => {
        return adaptServiceCall(() =>
          usersService.loadHomeownersByJobId(parent.id),
        );
      },
      tasks: (parent: { id: number }, _: unknown, context: RequestContext) => {
        return adaptServiceCall(() =>
          jobsService.loadTasksByJobId({ id: parent.id, context }),
        );
      },
    },
    Mutation: {
      createJob: (
        _: unknown,
        { input }: { input: CreateJobInput },
        context: RequestContext,
      ) => {
        return adaptServiceCall(() => {
          return jobsService.create({
            ...input,
            context,
          });
        });
      },
      updateJob: (
        _: unknown,
        { input, id }: { id: number; input: UpdateJobInput },
        context: RequestContext,
      ) => {
        return adaptServiceCall(() => {
          return jobsService.update({
            ...input,
            id,
            context,
          });
        });
      },
      deleteJob: (
        _: unknown,
        { id }: { id: number },
        context: RequestContext,
      ) => {
        return adaptServiceCall(() => {
          return jobsService.delete({
            id,
            context,
          });
        });
      },
      changeJobStatus: (
        _: unknown,
        { id, status }: { id: number; status: JobStatus },
        context: RequestContext,
      ) => {
        return adaptServiceCall(() => {
          return jobsService.changeStatus({ id, status, context });
        });
      },
      completeJobTask: (
        _: unknown,
        { id }: { id: number },
        context: RequestContext,
      ) => {
        return adaptServiceCall(() => {
          return jobsService.completeJobTask({ id, context });
        });
      },
    },
  };
};

type LoadJobsFilter = {
  page?: number;
  limit?: number;
  status?: JobStatus[];
  sortField?: LoadJobsSortField;
  sortDirection?: LoadJobsSortDirection;
};

type CreateJobInput = Pick<
  CreateJobPayload,
  | "description"
  | "cost"
  | "location"
  | "homeownerIds"
  | "startDate"
  | "endDate"
  | "tasks"
>;

type UpdateJobInput = Pick<
  UpdateJobPayload,
  "description" | "cost" | "location" | "homeownerIds" | "startDate" | "endDate"
>;
