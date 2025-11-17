import { ApolloServer } from "@apollo/server";
import { typeDefs } from "./schema";
import { buildResolvers } from "./resolvers";
import { AuthService } from "../service/auth/auth.service";
import { UsersRepository } from "../repository/users/users.repository";
import { db } from "../db";
import { UsersService } from "../service/users/users.service";
import { JobsRepository } from "../repository/jobs/jobs.repository";
import { JobsService } from "../service/jobs/jobs.service";
import type { RequestContext } from "../request_context";
import { JobChatMessageRepository } from "../repository/job_chat_message/job_chat_message.repository";
import { JobChatMessageService } from "../service/job_chat_message/job_chat_message.service";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { usersTypeDefs, buildUsersResolvers } from "./modules/users";
import { jobsTypeDefs, buildJobsResolvers } from "./modules/jobs";
import { buildDataLoaders } from "./dataloaders";
import {
  buildJobChatMessagesResolvers,
  jobChatMessagesTypeDefs,
} from "./modules/jobChatMessages";

export function createApolloServer() {
  const usersRepository = new UsersRepository(db);
  const jobsRepository = new JobsRepository(db);
  const jobChatMessageRepository = new JobChatMessageRepository(db);

  const authService = new AuthService(usersRepository);
  const usersService = new UsersService(usersRepository);
  const jobsService = new JobsService(jobsRepository);
  const jobChatMessageService = new JobChatMessageService(
    jobChatMessageRepository,
    jobsRepository,
  );

  const dataLoaders = buildDataLoaders({ usersService });

  const mergedTypeDefs = mergeTypeDefs([
    typeDefs,
    usersTypeDefs,
    jobsTypeDefs,
    jobChatMessagesTypeDefs,
  ]);
  const mergedResolvers = mergeResolvers([
    buildResolvers(),
    buildUsersResolvers({ usersService, authService }),
    buildJobsResolvers({ jobsService, dataLoaders, usersService }),
    buildJobChatMessagesResolvers({ jobChatMessageService, dataLoaders }),
  ]);

  return new ApolloServer<RequestContext>({
    typeDefs: mergedTypeDefs,
    resolvers: mergedResolvers,
  });
}
