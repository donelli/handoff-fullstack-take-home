import { DomainError } from "../error/domain_error";
import { NonEmptyStringScalar } from "./scalars";

export function buildResolvers() {
  return {
    NonEmptyString: NonEmptyStringScalar,
  };
}

export function adaptServiceCall<R, C extends () => R>(
  call: C,
): R | { __typename: string; message: string; code: string } {
  try {
    return call();
  } catch (error) {
    if (error instanceof DomainError) {
      return {
        __typename: error.name,
        message: error.message,
        code: error.code,
      };
    }

    throw error;
  }
}
