import { DomainError } from "../error/domain_error";
import type { AuthService } from "../service/auth/auth.service";
import type {
  CreateJobPayload,
  JobsService,
  UpdateJobPayload,
} from "../service/jobs/jobs.service";
import type { UsersService } from "../service/users/users.service";
import type { RequestContext } from "../request_context";
import { buildDataLoaders } from "./dataloaders";
import type { JobModel, JobStatus } from "~/models/job";

export type ResolverDependencies = {
  authService: AuthService;
  usersService: UsersService;
  jobsService: JobsService;
};

export function buildResolvers(dependencies: ResolverDependencies) {
  const { authService, usersService, jobsService } = dependencies;

  const dataLoaders = buildDataLoaders(dependencies);

  return {
    Query: {
      me: (_: unknown, __: unknown, context: RequestContext) => {
        return adaptServiceCall(() => authService.loadMe(context));
      },
      users: () => {
        return adaptServiceCall(() => usersService.loadAll());
      },
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
        parent: JobModel,
        _: unknown,
        context: RequestContext,
      ) => {
        return dataLoaders.users(context).load(parent.createdByUserId);
      },
      deletedByUser: (
        parent: JobModel,
        _: unknown,
        context: RequestContext,
      ) => {
        if (!parent.deletedByUserId) {
          return null;
        }

        return dataLoaders.users(context).load(parent.deletedByUserId);
      },
      homeowners: (parent: JobModel) => {
        return adaptServiceCall(() =>
          usersService.loadHomeownersByJobId(parent.id),
        );
      },
    },
    Mutation: {
      login: (
        _: unknown,
        { input }: { input: { username: string; password: string } },
      ) => {
        return adaptServiceCall(async () => {
          const result = await authService.login(input);
          return { ...result, __typename: "LoginSuccess" };
        });
      },
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
    },
  };
}

function adaptServiceCall<R, C extends () => R>(
  call: C,
): R | { __typename: string; message: string; code: string } {
  try {
    return call();
  } catch (error) {
    if (error instanceof DomainError) {
      return {
        __typename: error.name,
        message: error.message,
        code: error.code,
      };
    }

    throw error;
  }
}

type LoadJobsFilter = {
  page?: number;
  limit?: number;
};

type CreateJobInput = Pick<
  CreateJobPayload,
  "description" | "cost" | "location" | "homeownerIds"
>;

type UpdateJobInput = Pick<
  UpdateJobPayload,
  "description" | "cost" | "location" | "homeownerIds"
>;
