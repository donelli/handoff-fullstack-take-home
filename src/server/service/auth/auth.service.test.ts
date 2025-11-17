/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import jwt from "jsonwebtoken";
import { AuthService } from "./auth.service";
import type { UsersRepository } from "~/server/repository/users/users.repository";
import type { User } from "~/models/user";
import { UserType } from "~/models/user";
import { ProtectedRouteError } from "~/server/error/protected_route_error";
import type { RequestContext } from "~/server/request_context";
import { env } from "~/env";
import type { NextApiRequest } from "next";
import type { NextRequest } from "next/server";

// Mock jwt
vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

// Mock env
vi.mock("~/env", () => ({
  env: {
    JWT_SECRET: "test-secret-key",
  },
}));

describe("AuthService", () => {
  let mockUsersRepository: ReturnType<typeof mockDeep<UsersRepository>>;
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsersRepository = mockDeep<UsersRepository>();
    service = new AuthService(mockUsersRepository);
  });

  describe("login", () => {
    it("should successfully login with contractor credentials", async () => {
      const user: User = {
        id: 1,
        name: "Contractor User",
        type: UserType.CONTRACTOR,
      };

      const mockToken = "mock-jwt-token";

      mockUsersRepository.loadById.mockResolvedValue(user);
      vi.mocked(jwt.sign).mockReturnValue(mockToken as never);

      const result = await service.login({
        username: "contractor",
        password: "contractor",
      });

      expect(mockUsersRepository.loadById).toHaveBeenCalledWith(1);
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: user.id,
          userType: user.type,
          username: user.name,
        },
        env.JWT_SECRET,
        {
          expiresIn: "24h",
        },
      );
      expect(result).toEqual({
        user,
        token: mockToken,
      });
    });

    it("should successfully login with homeowner credentials", async () => {
      const user: User = {
        id: 2,
        name: "Homeowner User",
        type: UserType.HOMEOWNER,
      };

      const mockToken = "mock-jwt-token-homeowner";

      mockUsersRepository.loadById.mockResolvedValue(user);
      vi.mocked(jwt.sign).mockReturnValue(mockToken as never);

      const result = await service.login({
        username: "homeowner",
        password: "homeowner",
      });

      expect(mockUsersRepository.loadById).toHaveBeenCalledWith(2);
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: user.id,
          userType: user.type,
          username: user.name,
        },
        env.JWT_SECRET,
        {
          expiresIn: "24h",
        },
      );
      expect(result).toEqual({
        user,
        token: mockToken,
      });
    });

    it("should throw IncorrectUserOrPasswordError for invalid username", async () => {
      try {
        await service.login({
          username: "invalid",
          password: "contractor",
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Invalid username or password");
        expect((error as Error & { code: string }).code).toBe(
          "INVALID_USER_OR_EMAIL",
        );
      }

      expect(mockUsersRepository.loadById).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it("should throw IncorrectUserOrPasswordError for invalid password", async () => {
      await expect(
        service.login({
          username: "contractor",
          password: "wrong-password",
        }),
      ).rejects.toThrow("Invalid username or password");

      expect(mockUsersRepository.loadById).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it("should throw IncorrectUserOrPasswordError for both invalid username and password", async () => {
      await expect(
        service.login({
          username: "invalid",
          password: "wrong",
        }),
      ).rejects.toThrow("Invalid username or password");

      expect(mockUsersRepository.loadById).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it("should throw error when user is not found in repository", async () => {
      mockUsersRepository.loadById.mockResolvedValue(null);

      await expect(
        service.login({
          username: "contractor",
          password: "contractor",
        }),
      ).rejects.toThrow(
        "Error loading user, should always exist since it's mocked!",
      );

      expect(mockUsersRepository.loadById).toHaveBeenCalledWith(1);
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });

  describe("parseAndValidateToken", () => {
    it("should parse valid token from App Router Headers API", () => {
      const mockHeaders = {
        get: vi.fn((key: string) => {
          if (key === "authorization") {
            return "Bearer valid-token";
          }
          return null;
        }),
      };

      const mockReq = {
        headers: mockHeaders,
      } as unknown as NextRequest;

      const decodedJwt = {
        userId: 1,
        userType: UserType.CONTRACTOR,
        username: "Test User",
      };

      vi.mocked(jwt.verify).mockReturnValue(decodedJwt as never);

      const result = AuthService.parseAndValidateToken(mockReq);

      expect(mockHeaders.get).toHaveBeenCalledWith("authorization");
      expect(jwt.verify).toHaveBeenCalledWith("valid-token", env.JWT_SECRET);
      expect(result).toEqual({
        id: 1,
        type: UserType.CONTRACTOR,
      });
    });

    it("should parse valid token from Pages Router headers object", () => {
      const mockReq = {
        headers: {
          authorization: "Bearer valid-token",
        },
      } as NextApiRequest;

      const decodedJwt = {
        userId: 2,
        userType: UserType.HOMEOWNER,
        username: "Test Homeowner",
      };

      vi.mocked(jwt.verify).mockReturnValue(decodedJwt as never);

      const result = AuthService.parseAndValidateToken(mockReq);

      expect(jwt.verify).toHaveBeenCalledWith("valid-token", env.JWT_SECRET);
      expect(result).toEqual({
        id: 2,
        type: UserType.HOMEOWNER,
      });
    });

    it("should return undefined when authorization header is missing (App Router)", () => {
      const mockHeaders = {
        get: vi.fn(() => null),
      };

      const mockReq = {
        headers: mockHeaders,
      } as unknown as NextRequest;

      const result = AuthService.parseAndValidateToken(mockReq);

      expect(mockHeaders.get).toHaveBeenCalledWith("authorization");
      expect(jwt.verify).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it("should return undefined when authorization header is missing (Pages Router)", () => {
      const mockReq = {
        headers: {},
      } as NextApiRequest;

      const result = AuthService.parseAndValidateToken(mockReq);

      expect(jwt.verify).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it("should return undefined when authorization header does not start with Bearer", () => {
      const mockHeaders = {
        get: vi.fn((key: string) => {
          if (key === "authorization") {
            return "InvalidFormat token";
          }
          return null;
        }),
      };

      const mockReq = {
        headers: mockHeaders,
      } as unknown as NextRequest;

      const result = AuthService.parseAndValidateToken(mockReq);

      expect(mockHeaders.get).toHaveBeenCalledWith("authorization");
      expect(jwt.verify).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it("should return undefined when JWT verification fails", () => {
      const mockHeaders = {
        get: vi.fn((key: string) => {
          if (key === "authorization") {
            return "Bearer invalid-token";
          }
          return null;
        }),
      };

      const mockReq = {
        headers: mockHeaders,
      } as unknown as NextRequest;

      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const result = AuthService.parseAndValidateToken(mockReq);

      expect(jwt.verify).toHaveBeenCalledWith("invalid-token", env.JWT_SECRET);
      expect(result).toBeUndefined();
    });

    it("should extract token correctly when Bearer has multiple spaces", () => {
      const mockHeaders = {
        get: vi.fn((key: string) => {
          if (key === "authorization") {
            return "Bearer  valid-token-with-spaces";
          }
          return null;
        }),
      };

      const mockReq = {
        headers: mockHeaders,
      } as unknown as NextRequest;

      const decodedJwt = {
        userId: 1,
        userType: UserType.CONTRACTOR,
        username: "Test User",
      };

      vi.mocked(jwt.verify).mockReturnValue(decodedJwt as never);

      const result = AuthService.parseAndValidateToken(mockReq);

      // substring(7) should extract everything after "Bearer "
      expect(jwt.verify).toHaveBeenCalledWith(
        " valid-token-with-spaces",
        env.JWT_SECRET,
      );
      expect(result).toEqual({
        id: 1,
        type: UserType.CONTRACTOR,
      });
    });
  });

  describe("loadMe", () => {
    it("should return user when context has valid userData", async () => {
      const user: User = {
        id: 1,
        name: "Test User",
        type: UserType.CONTRACTOR,
      };

      const mockContext: RequestContext = {
        req: {} as Request,
        userData: {
          id: 1,
          type: UserType.CONTRACTOR,
        },
      };

      mockUsersRepository.loadById.mockResolvedValue(user);

      const result = await service.loadMe(mockContext);

      expect(mockUsersRepository.loadById).toHaveBeenCalledWith(1);
      expect(result).toEqual(user);
    });

    it("should throw ProtectedRouteError when context has no userData", async () => {
      const mockContext: RequestContext = {
        req: {} as Request,
        userData: undefined,
      };

      await expect(service.loadMe(mockContext)).rejects.toThrow(
        ProtectedRouteError,
      );

      expect(mockUsersRepository.loadById).not.toHaveBeenCalled();
    });

    it("should throw error when user is not found in database", async () => {
      const mockContext: RequestContext = {
        req: {} as Request,
        userData: {
          id: 999,
          type: UserType.CONTRACTOR,
        },
      };

      mockUsersRepository.loadById.mockResolvedValue(null);

      await expect(service.loadMe(mockContext)).rejects.toThrow(
        "User of this token don't exist on the database",
      );

      expect(mockUsersRepository.loadById).toHaveBeenCalledWith(999);
    });

    it("should return homeowner user when context has homeowner userData", async () => {
      const user: User = {
        id: 2,
        name: "Homeowner User",
        type: UserType.HOMEOWNER,
      };

      const mockContext: RequestContext = {
        req: {} as Request,
        userData: {
          id: 2,
          type: UserType.HOMEOWNER,
        },
      };

      mockUsersRepository.loadById.mockResolvedValue(user);

      const result = await service.loadMe(mockContext);

      expect(mockUsersRepository.loadById).toHaveBeenCalledWith(2);
      expect(result).toEqual(user);
    });
  });
});
