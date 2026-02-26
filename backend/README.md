 Auth Backend

## 📋 API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/auth/register` | Public | Register new user |
| POST | `/api/v1/auth/login` | Public | Login |
| POST | `/api/v1/auth/logout` | Private | Logout current session |
| POST | `/api/v1/auth/logout-all` | Private | Logout all devices |
| POST | `/api/v1/auth/refresh-token` | Public | Refresh tokens |
| GET | `/api/v1/auth/me` | Private | Get profile |
| GET | `/api/v1/auth/verify-email/:token` | Public | Verify email |
| POST | `/api/v1/auth/resend-verification` | Public | Resend verification |
| POST | `/api/v1/auth/forgot-password` | Public | Request reset |
| POST | `/api/v1/auth/reset-password` | Public | Reset password |
| POST | `/api/v1/auth/change-password` | Private | Change password |
| GET | `/api/v1/auth/sessions` | Private | List active sessions |
| POST | `/api/v1/auth/2fa/setup` | Private | Setup 2FA |
| POST | `/api/v1/auth/2fa/enable` | Private | Enable 2FA |
| POST | `/api/v1/auth/2fa/disable` | Private | Disable 2FA |
| POST | `/api/v1/auth/2fa/verify` | Public | Verify 2FA OTP |
| GET | `/api/v1/auth/oauth/google` | Public | Google OAuth |
| GET | `/api/v1/auth/oauth/facebook` | Public | Facebook OAuth |

## 🏗️ Architecture

```
Layered Architecture:
Controller → Service → Repository → MongoDB
```

## 🔒 Security Features
- JWT Access + Refresh Token rotation
- Bcrypt password hashing (12 rounds)
- Account lockout after 5 failed attempts
- Rate limiting per endpoint
- MongoDB sanitization
- Helmet security headers
- CORS protection
- Soft delete users
- Session management (max 5 devices)
- 2FA with TOTP + recovery codes
- SHA-256 token hashing for DB storage
