import { gql } from "graphql-tag";

// Define your GraphQL schema
export const typeDefs = gql`
  type Message {
    id: ID!
    text: String!
    createdAt: String!
  }

  type Query {
    hello: String!
    messages: [Message!]!
  }

  type Mutation {
    addMessage(text: String!): Message!
  }
`;
