import gql from "graphql-tag";

export const usersTypeDefs = gql`
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
    username: NonEmptyString!
    password: NonEmptyString!
  }

  type IncorrectUserOrPasswordError {
    message: String!
    code: String!
  }

  union LoginResult = LoginSuccess | IncorrectUserOrPasswordError

  type Job {
    homeowners: [User!]
  }

  type Query {
    users: [User!]!
    me: User!
  }

  type Mutation {
    login(input: LoginInput!): LoginResult!
  }
`;
