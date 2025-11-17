import { useMutation } from "@apollo/client";
import type { GraphQLFormattedError } from "graphql";
import { gql } from "graphql-tag";
import type { User } from "~/models/user";
import { useAuth } from "~/providers/auth-provider";

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      ... on LoginSuccess {
        token
        user {
          id
          name
          type
        }
      }
      ... on IncorrectUserOrPasswordError {
        message
        code
      }
    }
  }
`;

type LoginResponse = {
  login:
    | {
        token: string;
        user: User;
      }
    | {
        code: string;
        message: string;
      };
};

export class LoginError extends Error {
  constructor(private readonly errors: readonly GraphQLFormattedError[]) {
    super(errors[0]?.message);
  }

  get firstErrorCode(): string | null {
    return this.errors[0]?.extensions?.code as string | null;
  }
}

export function useLogin() {
  const [doLoginMutation, { loading }] =
    useMutation<LoginResponse>(LOGIN_MUTATION);
  const { login } = useAuth();

  const loginUser = async (username: string, password: string) => {
    const result = await doLoginMutation({
      variables: {
        input: {
          username,
          password,
        },
      },
    });

    const loginResult = result?.data?.login;

    if (!loginResult) {
      throw new Error("Unexpected login result");
    }

    if ("code" in loginResult) {
      return loginResult;
    }

    await login(loginResult.token, loginResult.user);
  };

  return {
    login: loginUser,
    loading,
  };
}
