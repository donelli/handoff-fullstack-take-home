import { GraphQLError, GraphQLScalarType, Kind } from "graphql";

export const NonEmptyStringScalar = new GraphQLScalarType({
  name: "NonEmptyString",
  description: "A string that cannot be empty (after trimming whitespace)",
  serialize(value: unknown): string {
    if (typeof value !== "string") {
      throw new GraphQLError(`Value is not a string: ${JSON.stringify(value)}`);
    }
    const trimmed = value.trim();
    if (trimmed === "") {
      throw new GraphQLError("Value cannot be an empty string");
    }
    return trimmed;
  },
  parseValue(value: unknown): string {
    if (typeof value !== "string") {
      throw new GraphQLError(`Value is not a string: ${JSON.stringify(value)}`);
    }
    const trimmed = value.trim();
    if (trimmed === "") {
      throw new GraphQLError("Value cannot be an empty string");
    }
    return trimmed;
  },
  parseLiteral(ast): string {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(`Can only parse strings, but got: ${ast.kind}`, {
        nodes: [ast],
      });
    }
    const trimmed = ast.value.trim();
    if (trimmed === "") {
      throw new GraphQLError("Value cannot be an empty string", {
        nodes: [ast],
      });
    }
    return trimmed;
  },
});
