import { startGraphqlAndGetNextHandler } from "~/server/server";

const handler = startGraphqlAndGetNextHandler();

export { handler as GET, handler as POST };
