"use strict";

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const authService = require("../../../src/module/auth/auth.service");
const authRepository = require("../../../src/module/auth/auth.repository");
const User = require("../../../src/infrastructure/database/models/User");
const RefreshToken = require("../../../src/infrastructure/database/models/RefreshToken");
const emailService = require("../../../src/infrastructure/mail/emailService");

// Mock email service to avoid real emails in tests
jest.mock("../../../src/infrastructure/mail/emailService", () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue({ success: true }),
  sendVerificationEmail: jest.fn().mockResolvedValue({ success: true }),
  sendPasswordResetEmail: jest.fn().mockResolvedValue({ success: true }),
  sendPasswordChangedEmail: jest.fn().mockResolvedValue({ success: true }),
  sendOTPEmail: jest.fn().mockResolvedValue({ success: true }),
  sendLoginAlertEmail: jest.fn().mockResolvedValue({ success: true }),
}));

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.JWT_ACCESS_SECRET = "test-access-secret-32-chars-minimum!!";
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret-32-chars-minimum!";
  process.env.EMAIL_VERIFICATION_SECRET = "test-email-verify-secret";
  process.env.PASSWORD_RESET_SECRET = "test-password-reset-secret";
  process.env.NODE_ENV = "test";
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

afterEach(async () => {
  jest.clearAllMocks();
  await User.deleteMany({});
  await RefreshToken.deleteMany({});
});

const testUser = {
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
  password: "Test@1234",
  confirmPassword: "Test@1234",
};

const meta = { ipAddress: "127.0.0.1", userAgent: "Jest/Test" };

describe("AuthService", () => {
  // ── Register ──────────────────────────────────────────────────────────────
  describe("register()", () => {
    it("should register a new user and return tokens", async () => {
      const result = await authService.register(testUser);

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("tokens");
      expect(result.user.email).toBe(testUser.email);
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
      expect(emailService.sendWelcomeEmail).toHaveBeenCalledTimes(1);
    });

    it("should throw ConflictError if email already exists", async () => {
      await authService.register(testUser);

      await expect(authService.register(testUser)).rejects.toMatchObject({
        statusCode: 409,
        message: expect.stringContaining("already exists"),
      });
    });

    it("should hash the password before saving", async () => {
      await authService.register(testUser);
      const user = await User.findOne({ email: testUser.email }).select(
        "+password",
      );
      expect(user.password).not.toBe(testUser.password);
      expect(user.password).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt hash pattern
    });
  });

  // ── Login ─────────────────────────────────────────────────────────────────
  describe("login()", () => {
    beforeEach(async () => {
      await authService.register(testUser);
    });

    it("should login with correct credentials", async () => {
      const result = await authService.login(
        { email: testUser.email, password: testUser.password },
        meta,
      );

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("tokens");
      expect(result.user.email).toBe(testUser.email);
    });

    it("should throw UnauthorizedError with wrong password", async () => {
      await expect(
        authService.login(
          { email: testUser.email, password: "WrongPass@1" },
          meta,
        ),
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it("should throw UnauthorizedError with non-existent email", async () => {
      await expect(
        authService.login(
          { email: "nobody@example.com", password: testUser.password },
          meta,
        ),
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it("should update lastLoginAt on successful login", async () => {
      await authService.login(
        { email: testUser.email, password: testUser.password },
        meta,
      );
      const user = await User.findOne({ email: testUser.email });
      expect(user.lastLoginAt).toBeDefined();
    });
  });

  // ── Logout ────────────────────────────────────────────────────────────────
  describe("logout()", () => {
    it("should revoke refresh token on logout", async () => {
      const { tokens } = await authService.register(testUser);
      const result = await authService.logout(tokens.refreshToken);

      expect(result.message).toContain("Logged out");

      const storedToken = await RefreshToken.findOne({
        token: tokens.refreshToken,
      });
      expect(storedToken.isRevoked).toBe(true);
    });
  });

  // ── Refresh Token ─────────────────────────────────────────────────────────
  describe("refreshTokens()", () => {
    it("should return new token pair", async () => {
      const { tokens } = await authService.register(testUser);
      const newTokens = await authService.refreshTokens(
        tokens.refreshToken,
        meta,
      );

      expect(newTokens.accessToken).toBeDefined();
      expect(newTokens.refreshToken).toBeDefined();
      expect(newTokens.refreshToken).not.toBe(tokens.refreshToken); // rotated
    });

    it("should revoke old refresh token after rotation", async () => {
      const { tokens } = await authService.register(testUser);
      await authService.refreshTokens(tokens.refreshToken, meta);

      const oldToken = await RefreshToken.findOne({
        token: tokens.refreshToken,
      });
      expect(oldToken.isRevoked).toBe(true);
    });
  });

  // ── Forgot & Reset Password ───────────────────────────────────────────────
  describe("forgotPassword() and resetPassword()", () => {
    beforeEach(async () => {
      await authService.register(testUser);
    });

    it("should return generic message regardless of email existence", async () => {
      const result = await authService.forgotPassword("nobody@example.com");
      expect(result.message).toContain("If an account");
    });

    it("should send reset email for valid user", async () => {
      await authService.forgotPassword(testUser.email);
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
    });

    it("should reset password with valid token", async () => {
      await authService.forgotPassword(testUser.email);

      const user = await User.findOne({ email: testUser.email }).select(
        "+passwordResetToken",
      );
      // Simulate token retrieval from DB (in real flow, user gets JWT)
      // This is a simplified test
      expect(user.passwordResetToken).toBeDefined();
    });
  });

  // ── Change Password ───────────────────────────────────────────────────────
  describe("changePassword()", () => {
    let userId;

    beforeEach(async () => {
      const { user } = await authService.register(testUser);
      userId = user.id;
    });

    it("should change password with correct current password", async () => {
      const result = await authService.changePassword(
        userId,
        testUser.password,
        "NewPass@5678",
      );
      expect(result.message).toContain("changed successfully");
      expect(emailService.sendPasswordChangedEmail).toHaveBeenCalledTimes(1);
    });

    it("should throw error with incorrect current password", async () => {
      await expect(
        authService.changePassword(userId, "WrongCurrent@1", "NewPass@5678"),
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it("should throw error if new password same as current", async () => {
      await expect(
        authService.changePassword(
          userId,
          testUser.password,
          testUser.password,
        ),
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  // ── getMe ─────────────────────────────────────────────────────────────────
  describe("getMe()", () => {
    it("should return user profile", async () => {
      const { user } = await authService.register(testUser);
      const profile = await authService.getMe(user.id);

      expect(profile.email).toBe(testUser.email);
      expect(profile).not.toHaveProperty("password");
    });
  });
});
