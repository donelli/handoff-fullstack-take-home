import { gql } from "graphql-tag";

export const typeDefs = gql`
  type Query {
    users: [User!]!
    jobs(filter: JobsFilterInput!): LoadJobsResult!
    me: User!
  }

  type LoadJobsResult {
    page: Int!
    limit: Int!
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
    createdByUserId: Int!
    createdByUser: User!
    deletedAt: String
    deletedByUserId: Int
    deletedByUser: User
    homeowners: [User!]
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

  input CreateJobInput {
    description: String!
    location: String!
    cost: Float!
    homeownerIds: [Int!]!
    createdByUserId: Int!
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

  type Mutation {
    login(input: LoginInput!): LoginResult!
    createJob(input: CreateJobInput!): CreateJobResult!
    updateJob(id: Int!, input: UpdateJobInput!): UpdateJobResult!
    deleteJob(id: Int!): Boolean!
  }
`;
