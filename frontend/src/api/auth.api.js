import authConfig from "@/config/auth.config";
import { ENDPOINTS } from "@/config/api.config";
import { get, post } from "@/api/client";
import { del } from "@/api/client";

const authService = {
  register: (data) => post(ENDPOINTS.AUTH.REGISTER, data),
  login: (data) => post(ENDPOINTS.AUTH.LOGIN, data),
  logout: () => post(ENDPOINTS.AUTH.LOGOUT, {}),
  logoutAll: () => post(ENDPOINTS.AUTH.LOGOUT_ALL),
  refreshToken: () => post(ENDPOINTS.AUTH.REFRESH_TOKEN, {}),
  getMe: () => get(ENDPOINTS.AUTH.ME),
  verifyEmail: (token) =>
    post(ENDPOINTS.AUTH.VERIFY_EMAIL, { token }, {
      select: (payload, response) => ({
        user: payload,
        message: response?.data?.message,
      }),
    }),
  resendVerification: (email) =>
    post(ENDPOINTS.AUTH.RESEND_VERIFICATION, { email }),
  forgotPassword: (email) =>
    post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),
  resetPassword: (data) => post(ENDPOINTS.AUTH.RESET_PASSWORD, data),
  changePassword: (data) => post(ENDPOINTS.AUTH.CHANGE_PASSWORD, data),
  getActiveSessions: () => get(ENDPOINTS.AUTH.SESSIONS),

  /**
   * Revoke a single active session by its ID. The server will invalidate the
   * refresh token associated with the session. After revocation, the session
   * will be removed from the active sessions list. This call does not return
   * any payload on success.
   *
   * @param {string} sessionId - The identifier of the session to revoke.
   * @returns {Promise<void>} A promise that resolves when the session is revoked.
   */
  revokeSession: (sessionId) => del(ENDPOINTS.AUTH.SESSION(sessionId)),
  setup2FA: () => post(ENDPOINTS.AUTH.TWO_FACTOR.SETUP),
  enable2FA: (token) => post(ENDPOINTS.AUTH.TWO_FACTOR.ENABLE, { token }),
  disable2FA: (password) =>
    post(ENDPOINTS.AUTH.TWO_FACTOR.DISABLE, { password }),
  verifyTwoFactor: (email, otp) =>
    post(ENDPOINTS.AUTH.TWO_FACTOR.VERIFY, { email, otp }),
  googleOAuth: () => {
    window.location.href = `${authConfig.apiBaseUrl}${ENDPOINTS.AUTH.OAUTH.GOOGLE}`;
  },
  facebookOAuth: () => {
    window.location.href = `${authConfig.apiBaseUrl}${ENDPOINTS.AUTH.OAUTH.FACEBOOK}`;
  },
};

export default authService;
