import { gql } from "graphql-tag";

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

  enum UserType {
    CONTRACTOR
    HOMEOWNER
  }

  type User {
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

  type Mutation {
    addMessage(text: String!): Message!
    login(input: LoginInput!): LoginResult!
  }
`;
