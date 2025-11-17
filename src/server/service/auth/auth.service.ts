import jwt from "jsonwebtoken";
import { type User, type UserType } from "~/models/user";
import { env } from "~/env";
import { DomainError } from "~/server/error/domain_error";
import type { UsersRepository } from "~/server/repository/users/users.repository";
import type { NextApiRequest } from "next";
import type { NextRequest } from "next/server";
import type {
  RequestContext,
  RequestContextUserData,
} from "~/server/request_context";
import { ProtectedRouteError } from "~/server/error/protected_route_error";
import { logger } from "~/server/logger";

type LoginPayload = {
  username: string;
  password: string;
};

type LoginResult = {
  token: string;
  user: User;
};

class IncorrectUserOrPasswordError extends DomainError {
  constructor() {
    super("Invalid username or password", "INVALID_USER_OR_EMAIL");
    this.name = "IncorrectUserOrPasswordError";
  }
}

const JWT_EXPIRATION = "24h";

export class AuthService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async login(payload: LoginPayload): Promise<LoginResult> {
    let userId: number | null = null;

    if (
      payload.username === "contractor" &&
      payload.password === "contractor"
    ) {
      userId = 1;
    }

    if (payload.username === "homeowner" && payload.password === "homeowner") {
      userId = 2;
    }

    if (!userId) {
      throw new IncorrectUserOrPasswordError();
    }

    const user = await this.usersRepository.loadById(userId);

    if (!user) {
      throw new Error(
        "Error loading user, should always exist since it's mocked!",
      );
    }

    const token = jwt.sign(
      {
        userId: user.id,
        userType: user.type,
        username: user.name,
      },
      env.JWT_SECRET,
      {
        expiresIn: JWT_EXPIRATION,
      },
    );

    return { user, token };
  }

  static parseAndValidateToken(
    req: NextApiRequest | NextRequest | Request,
  ): RequestContextUserData | undefined {
    const authorizationHeader =
      "headers" in req && typeof req.headers.get === "function"
        ? req.headers.get("authorization") // App Router: Headers API
        : (req as NextApiRequest).headers.authorization; // Pages Router: object property

    if (!authorizationHeader) {
      return undefined;
    }

    if (!authorizationHeader.startsWith("Bearer ")) {
      return undefined;
    }

    const token = authorizationHeader.substring(7);

    try {
      const decodedJwt = jwt.verify(token, env.JWT_SECRET) as {
        userId: number;
        userType: string;
        username: string;
      };

      // FIXME: Load user from database to ensure we get the most updated data

      return {
        id: decodedJwt.userId,
        type: decodedJwt.userType as UserType,
      };
    } catch (error) {
      logger.error("Error parsing and validating token", error);
      return undefined;
    }
  }

  async loadMe(context: RequestContext) {
    const userId = context.userData?.id;

    if (!userId) {
      throw new ProtectedRouteError();
    }

    const user = await this.usersRepository.loadById(userId);
    if (!user) {
      throw new Error("User of this token don't exist on the database");
    }

    return user;
  }
}
