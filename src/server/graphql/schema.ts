import { gql } from "graphql-tag";

export const typeDefs = gql`
  type LoadJobsResult {
    page: Int!
    limit: Int!
    total: Int!
    data: [Job!]!
  }

  input JobsFilterInput {
    createdByUserId: Int
    homeownerId: Int
    page: Int
    limit: Int
  }

  type Job {
    id: Int!
    description: String!
    location: String!
    cost: Float!
    status: JobStatus!
    createdAt: String!
    updatedAt: String!
    createdByUserId: Int!
    createdByUser: User!
    deletedAt: String
    deletedByUserId: Int
    deletedByUser: User
    homeowners: [User!]
    jobChatMessages: [JobChatMessage!]!
  }

  enum UserType {
    CONTRACTOR
    HOMEOWNER
  }

  type User {
    id: Int!
    name: String!
    type: UserType!
  }

  type LoginSuccess {
    token: String!
    user: User!
  }

  input LoginInput {
    username: String!
    password: String!
  }

  type IncorrectUserOrPasswordError {
    message: String!
    code: String!
  }

  union LoginResult = LoginSuccess | IncorrectUserOrPasswordError

  enum JobStatus {
    PLANNING
    IN_PROGRESS
    COMPLETED
    CANCELED
  }

  type JobChatMessage {
    id: Int!
    content: String!
    createdAt: String!
    createdByUserId: Int!
    createdByUser: User!
  }

  input CreateJobInput {
    description: String!
    location: String!
    cost: Float!
    homeownerIds: [Int!]!
  }

  type CreateJobResult {
    data: Job
  }

  input UpdateJobInput {
    description: String
    location: String
    cost: Float
    homeownerIds: [Int!]
  }

  type UpdateJobResult {
    data: Job
  }

  type ChangeJobStatusResult {
    data: Job!
  }

  input CreateJobChatMessageInput {
    content: String!
    jobId: Int!
  }

  type CreateJobChatMessageResult {
    data: JobChatMessage!
  }

  type Query {
    users: [User!]!
    jobs(filter: JobsFilterInput!): LoadJobsResult!
    job(id: Int!): Job
    me: User!
    jobChatMessages(jobId: Int!): [JobChatMessage!]!
  }

  type Mutation {
    login(input: LoginInput!): LoginResult!
    createJob(input: CreateJobInput!): CreateJobResult!
    updateJob(id: Int!, input: UpdateJobInput!): UpdateJobResult!
    deleteJob(id: Int!): Boolean!
    changeJobStatus(id: Int!, status: JobStatus!): ChangeJobStatusResult!
    createJobChatMessage(
      input: CreateJobChatMessageInput!
    ): CreateJobChatMessageResult!
  }
`;
