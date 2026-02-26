'use strict';

// ── Register DTO ──────────────────────────────────────────────────────────────
class RegisterDTO {
  constructor(data) {
    this.firstName = data.firstName?.trim();
    this.lastName = data.lastName?.trim();
    this.email = data.email?.toLowerCase().trim();
    this.password = data.password;
    this.confirmPassword = data.confirmPassword;
    this.phone = data.phone?.trim() || null;
    this.role = data.role || 'user';
  }
}

// ── Login DTO ────────────────────────────────────────────────────────────────
class LoginDTO {
  constructor(data) {
    this.email = data.email?.toLowerCase().trim();
    this.password = data.password;
    this.rememberMe = data.rememberMe || false;
  }
}

// ── Forgot Password DTO ───────────────────────────────────────────────────────
class ForgotPasswordDTO {
  constructor(data) {
    this.email = data.email?.toLowerCase().trim();
  }
}

// ── Reset Password DTO ────────────────────────────────────────────────────────
class ResetPasswordDTO {
  constructor(data) {
    this.token = data.token;
    this.password = data.password;
    this.confirmPassword = data.confirmPassword;
  }
}

// ── Change Password DTO ───────────────────────────────────────────────────────
class ChangePasswordDTO {
  constructor(data) {
    this.currentPassword = data.currentPassword;
    this.newPassword = data.newPassword;
    this.confirmNewPassword = data.confirmNewPassword;
  }
}

// ── Token DTO (Response) ──────────────────────────────────────────────────────
class TokenDTO {
  constructor({ accessToken, refreshToken, expiresIn }) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tokenType = 'Bearer';
    this.expiresIn = expiresIn || '15m';
  }
}

// ── User Response DTO ─────────────────────────────────────────────────────────
class UserResponseDTO {
  constructor(user) {
    this.id = user._id || user.id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.fullName = user.fullName || `${user.firstName} ${user.lastName}`;
    this.email = user.email;
    this.phone = user.phone || null;
    this.role = user.role;
    this.avatar = user.avatar || null;
    this.bio = user.bio || null;
    this.isEmailVerified = user.isEmailVerified;
    this.isTwoFactorEnabled = user.isTwoFactorEnabled;
    this.oauthProvider = user.oauthProvider;
    this.lastLoginAt = user.lastLoginAt || null;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}

// ── Auth Response DTO (Login/Register) ────────────────────────────────────────
class AuthResponseDTO {
  constructor({ user, tokens }) {
    this.user = new UserResponseDTO(user);
    this.tokens = new TokenDTO(tokens);
  }
}

// ── OTP DTO ───────────────────────────────────────────────────────────────────
class OTPVerifyDTO {
  constructor(data) {
    this.email = data.email?.toLowerCase().trim();
    this.otp = data.otp?.trim();
  }
}

// ── OAuth DTO ─────────────────────────────────────────────────────────────────
class OAuthDTO {
  constructor(data) {
    this.provider = data.provider;
    this.accessToken = data.accessToken;
    this.idToken = data.idToken || null;
  }
}

module.exports = {
  RegisterDTO,
  LoginDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  ChangePasswordDTO,
  TokenDTO,
  UserResponseDTO,
  AuthResponseDTO,
  OTPVerifyDTO,
  OAuthDTO,
};
