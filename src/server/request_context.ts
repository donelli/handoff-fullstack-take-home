import type { NextApiRequest } from "next";
import type { NextRequest } from "next/server";
import type { UserType } from "~/models/user";

export type RequestContext = {
  req: NextApiRequest | NextRequest | Request;
  userData?: RequestContextUserData;
};

export type RequestContextUserData = {
  id: number;
  type: UserType;
};
