import gql from "graphql-tag";

export const jobsTypeDefs = gql`
  type LoadJobsResult {
    page: Int!
    limit: Int!
    total: Int!
    data: [Job!]!
  }

  input JobsFilterInput {
    page: Int
    limit: Int
    status: [JobStatus!]
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
  }

  enum JobStatus {
    PLANNING
    IN_PROGRESS
    COMPLETED
    CANCELED
  }

  input CreateJobInput {
    description: NonEmptyString!
    location: NonEmptyString!
    cost: Float!
    homeownerIds: [Int!]!
  }

  type CreateJobResult {
    data: Job
  }

  input UpdateJobInput {
    description: NonEmptyString
    location: NonEmptyString
    cost: Float
    homeownerIds: [Int!]
  }

  type UpdateJobResult {
    data: Job
  }

  type ChangeJobStatusResult {
    data: Job!
  }

  type Query {
    jobs(filter: JobsFilterInput!): LoadJobsResult!
    job(id: Int!): Job
  }

  type Mutation {
    createJob(input: CreateJobInput!): CreateJobResult!
    updateJob(id: Int!, input: UpdateJobInput!): UpdateJobResult!
    deleteJob(id: Int!): Boolean!
    changeJobStatus(id: Int!, status: JobStatus!): ChangeJobStatusResult!
  }
`;
