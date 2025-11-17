import gql from "graphql-tag";

export const jobChatMessagesTypeDefs = gql`
  type JobChatMessage {
    id: Int!
    content: String!
    createdAt: String!
    createdByUserId: Int!
    createdByUser: User!
  }

  type Job {
    jobChatMessages: [JobChatMessage!]!
  }

  input CreateJobChatMessageInput {
    content: NonEmptyString!
    jobId: Int!
  }

  type CreateJobChatMessageResult {
    data: JobChatMessage!
  }

  type Query {
    jobChatMessages(jobId: Int!): [JobChatMessage!]!
  }

  type Mutation {
    createJobChatMessage(
      input: CreateJobChatMessageInput!
    ): CreateJobChatMessageResult!
  }
`;
