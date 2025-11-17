import gql from "graphql-tag";

export const jobsTypeDefs = gql`
  type LoadJobsResult {
    page: Int!
    limit: Int!
    total: Int!
    data: [Job!]!
  }

  enum JobSortField {
    START_DATE
    END_DATE
    STATUS
    UPDATED_AT
    CREATED_AT
  }

  enum JobSortDirection {
    ASC
    DESC
  }

  input JobsFilterInput {
    page: Int
    limit: Int
    status: [JobStatus!]
    sortField: JobSortField
    sortDirection: JobSortDirection
  }

  type Job {
    id: Int!
    description: String!
    location: String!
    cost: Float!
    status: JobStatus!
    startDate: String
    endDate: String
    createdAt: String!
    updatedAt: String!
    createdByUserId: Int!
    createdByUser: User!
    deletedAt: String
    deletedByUserId: Int
    deletedByUser: User
    homeowners: [User!]
    tasks: [JobTask!]
  }

  enum JobStatus {
    PLANNING
    IN_PROGRESS
    COMPLETED
    CANCELED
  }

  type JobTask {
    id: Int!
    description: String!
    completedAt: String
    completedByUserId: Int
    cost: Float
  }

  input JobTaskCreateInput {
    description: String!
    cost: Float
  }

  input JobTaskUpdateInput {
    id: Int
    description: String
    cost: Float
  }

  input CreateJobInput {
    description: NonEmptyString!
    location: NonEmptyString!
    cost: Float!
    homeownerIds: [Int!]!
    startDate: String
    endDate: String
    tasks: [JobTaskCreateInput!]
  }

  type CreateJobResult {
    data: Job
  }

  input UpdateJobInput {
    description: NonEmptyString
    location: NonEmptyString
    cost: Float
    homeownerIds: [Int!]
    startDate: String
    endDate: String
    tasks: [JobTaskUpdateInput!]
  }

  type UpdateJobResult {
    data: Job
  }

  type ChangeJobStatusResult {
    data: Job!
  }

  type CompleteJobTaskResult {
    data: JobTask!
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
    completeJobTask(id: Int!): CompleteJobTaskResult!
  }
`;
