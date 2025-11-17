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

export function createApolloServer() {
  const usersRepository = new UsersRepository(db);
  const jobsRepository = new JobsRepository(db);
  const jobChatMessageRepository = new JobChatMessageRepository(db);

  const authService = new AuthService(usersRepository);
  const usersService = new UsersService(usersRepository);
  const jobsService = new JobsService(jobsRepository);
  const jobChatMessageService = new JobChatMessageService(
    jobChatMessageRepository,
  );

  return new ApolloServer<RequestContext>({
    typeDefs,
    resolvers: buildResolvers({
      authService,
      usersService,
      jobsService,
      jobChatMessageService,
    }),
  });
}
