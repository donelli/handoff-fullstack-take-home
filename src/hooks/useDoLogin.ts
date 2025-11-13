import { useMutation } from "@apollo/client";
import type { GraphQLFormattedError } from "graphql";
import { gql } from "graphql-tag";
import type { User } from "~/models/user";
import { useAuth } from "~/providers/auth-provider";

const QUERY = gql`
  mutation Mutation($input: LoginInput!) {
    login(input: $input) {
      ... on LoginSuccess {
        token
        user {
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
      };
};

export class MutationError extends Error {
  constructor(private readonly errors: readonly GraphQLFormattedError[]) {
    super(errors[0]?.message);
  }

  get firstErrorCode(): string | null {
    return this.errors[0]?.extensions?.code as string | null;
  }
}

export function useDoLogin() {
  const [doLoginMutation, { loading }] = useMutation<LoginResponse>(QUERY);
  const { login } = useAuth();

  const doLogin = async (username: string, password: string) => {
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
    doLogin,
    loading,
  };
}
