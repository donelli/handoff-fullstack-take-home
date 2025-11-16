import { useQuery, gql } from "@apollo/client";
import { useMemo } from "react";
import { UserType, type User } from "~/models/user";

const USERS_QUERY = gql`
  query Users {
    users {
      id
      name
      type
    }
  }
`;

type UsersQueryResponse = {
  users: User[];
};

export function useUsers() {
  const { data, loading, error } = useQuery<UsersQueryResponse>(USERS_QUERY);

  const users = useMemo(() => data?.users ?? [], [data?.users]);

  const contractors = useMemo(
    () => users.filter((user) => user.type === UserType.CONTRACTOR),
    [users],
  );

  const homeowners = useMemo(
    () => users.filter((user) => user.type === UserType.HOMEOWNER),
    [users],
  );

  return {
    users,
    contractors,
    homeowners,
    loading,
    error,
  };
}

