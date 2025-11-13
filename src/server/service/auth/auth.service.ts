import { UserType, type User } from "~/models/user";
import { DomainError } from "~/server/error/domain_error";

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

// Dummy tokens for now, but in production, this would be a JWT token issued by the auth service.
const CONTRACTOR_USER_TOKEN = "dummy_contractor_user_token";
const HOMEOWNER_USER_TOKEN = "dummy_homeowner_user_token";

export class AuthService {
  login(payload: LoginPayload): LoginResult {
    let user: User | null = null;
    let token: string | null = null;

    if (
      payload.username === "contractor" &&
      payload.password === "contractor"
    ) {
      user = {
        type: UserType.CONTRACTOR,
        name: "Contractor User",
      };
      token = CONTRACTOR_USER_TOKEN;
    }

    if (payload.username === "homeowner" && payload.password === "homeowner") {
      user = {
        type: UserType.HOMEOWNER,
        name: "Homeowner User",
      };
      token = HOMEOWNER_USER_TOKEN;
    }

    if (!user || !token) {
      throw new IncorrectUserOrPasswordError();
    }

    return { user, token };
  }
}
