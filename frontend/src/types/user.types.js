// frontend/src/types/auth.types.js

/**
 * User roles for role-based access control
 */
export const UserRole = {
  ADMIN: 'admin',
  ORGANIZER: 'organizer',
  USER: 'user',
  GUEST: 'guest'
};

/**
 * User permissions
 */
export const UserPermission = {
  // Event permissions
  CREATE_EVENT: 'create_event',
  EDIT_EVENT: 'edit_event',
  DELETE_EVENT: 'delete_event',
  PUBLISH_EVENT: 'publish_event',
  MANAGE_EVENTS: 'manage_events',
  
  // Ticket permissions
  CREATE_TICKET: 'create_ticket',
  EDIT_TICKET: 'edit_ticket',
  DELETE_TICKET: 'delete_ticket',
  MANAGE_TICKETS: 'manage_tickets',
  
  // Booking permissions
  VIEW_BOOKINGS: 'view_bookings',
  MANAGE_BOOKINGS: 'manage_bookings',
  CANCEL_BOOKING: 'cancel_booking',
  REFUND_BOOKING: 'refund_booking',
  
  // User permissions
  VIEW_USERS: 'view_users',
  MANAGE_USERS: 'manage_users',
  BLOCK_USERS: 'block_users',
  
  // Payment permissions
  VIEW_PAYMENTS: 'view_payments',
  MANAGE_PAYMENTS: 'manage_payments',
  REFUND_PAYMENT: 'refund_payment',
  
  // Content permissions
  MANAGE_CATEGORIES: 'manage_categories',
  MANAGE_VENUES: 'manage_venues',
  MANAGE_REVIEWS: 'manage_reviews',
  
  // System permissions
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_SYSTEM: 'manage_system'
};

/**
 * Authentication methods
 */
export const AuthMethod = {
  EMAIL: 'email',
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  APPLE: 'apple',
  PHONE: 'phone'
};

/**
 * Account status
 */
export const AccountStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
  PENDING_VERIFICATION: 'pending_verification',
  DELETED: 'deleted'
};

/**
 * Email verification status
 */
export const EmailVerificationStatus = {
  VERIFIED: 'verified',
  UNVERIFIED: 'unverified',
  PENDING: 'pending',
  EXPIRED: 'expired'
};

/**
 * Phone verification status
 */
export const PhoneVerificationStatus = {
  VERIFIED: 'verified',
  UNVERIFIED: 'unverified',
  PENDING: 'pending',
  EXPIRED: 'expired'
};

/**
 * Two-factor authentication methods
 */
export const TwoFactorMethod = {
  AUTHENTICATOR: 'authenticator',
  SMS: 'sms',
  EMAIL: 'email',
  NONE: 'none'
};

/**
 * Session status
 */
export const SessionStatus = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
  SUSPICIOUS: 'suspicious'
};

/**
 * Login history types
 */
export const LoginType = {
  MANUAL: 'manual',
  SSO: 'sso',
  REMEMBER_ME: 'remember_me',
  TOKEN: 'token'
};

/**
 * Device types
 */
export const DeviceType = {
  DESKTOP: 'desktop',
  MOBILE: 'mobile',
  TABLET: 'tablet',
  UNKNOWN: 'unknown'
};

/**
 * User interface for type checking
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} name - User full name
 * @property {string} role - User role from UserRole enum
 * @property {string[]} permissions - Array of permissions from UserPermission
 * @property {string} avatar - Avatar URL
 * @property {string} phone - Phone number
 * @property {string} status - Account status from AccountStatus
 * @property {string} emailVerified - Email verification status
 * @property {string} phoneVerified - Phone verification status
 * @property {string} twoFactorMethod - 2FA method from TwoFactorMethod
 * @property {boolean} twoFactorEnabled - Whether 2FA is enabled
 * @property {string} lastLogin - Last login timestamp
 * @property {string} lastLoginIp - Last login IP address
 * @property {string} lastLoginDevice - Last login device
 * @property {string} createdAt - Account creation timestamp
 * @property {string} updatedAt - Account last update timestamp
 * @property {Object} preferences - User preferences
 * @property {string[]} notificationChannels - Preferred notification channels
 * @property {Object} socialLinks - Social media links
 */

/**
 * Login credentials interface
 * @typedef {Object} LoginCredentials
 * @property {string} email - User email
 * @property {string} password - User password
 * @property {boolean} rememberMe - Remember me flag
 */

/**
 * Registration data interface
 * @typedef {Object} RegistrationData
 * @property {string} email - User email
 * @property {string} password - User password
 * @property {string} name - User full name
 * @property {string} phone - Phone number
 * @property {string} role - User role (defaults to USER)
 * @property {string} authMethod - Authentication method
 */

/**
 * Auth response interface
 * @typedef {Object} AuthResponse
 * @property {boolean} success - Success flag
 * @property {Object} user - User object
 * @property {string} token - Access token
 * @property {string} refreshToken - Refresh token
 * @property {string} message - Response message
 * @property {Object} error - Error details
 */

/**
 * Token payload interface
 * @typedef {Object} TokenPayload
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} role - User role
 * @property {string[]} permissions - User permissions
 * @property {number} iat - Issued at timestamp
 * @property {number} exp - Expiration timestamp
 */

/**
 * Role-based access configuration
 */
export const RolePermissions = {
  [UserRole.ADMIN]: Object.values(UserPermission), // Admin has all permissions
  
  [UserRole.ORGANIZER]: [
    UserPermission.CREATE_EVENT,
    UserPermission.EDIT_EVENT,
    UserPermission.DELETE_EVENT,
    UserPermission.PUBLISH_EVENT,
    UserPermission.MANAGE_EVENTS,
    UserPermission.CREATE_TICKET,
    UserPermission.EDIT_TICKET,
    UserPermission.DELETE_TICKET,
    UserPermission.MANAGE_TICKETS,
    UserPermission.VIEW_BOOKINGS,
    UserPermission.MANAGE_BOOKINGS,
    UserPermission.CANCEL_BOOKING,
    UserPermission.VIEW_PAYMENTS,
    UserPermission.VIEW_ANALYTICS,
    UserPermission.MANAGE_VENUES,
    UserPermission.MANAGE_REVIEWS
  ],
  
  [UserRole.USER]: [
    UserPermission.VIEW_BOOKINGS,
    UserPermission.CANCEL_BOOKING
  ],
  
  [UserRole.GUEST]: []
};

/**
 * Check if a role has a specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export const hasPermission = (role, permission) => {
  if (role === UserRole.ADMIN) return true;
  return RolePermissions[role]?.includes(permission) || false;
};

/**
 * Check if a role has any of the given permissions
 * @param {string} role - User role
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean}
 */
export const hasAnyPermission = (role, permissions) => {
  if (role === UserRole.ADMIN) return true;
  return permissions.some(permission => hasPermission(role, permission));
};

/**
 * Check if a role has all of the given permissions
 * @param {string} role - User role
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean}
 */
export const hasAllPermissions = (role, permissions) => {
  if (role === UserRole.ADMIN) return true;
  return permissions.every(permission => hasPermission(role, permission));
};

/**
 * Get all permissions for a role
 * @param {string} role - User role
 * @returns {string[]}
 */
export const getPermissionsForRole = (role) => {
  return RolePermissions[role] || [];
};

/**
 * Check if a role can access a route based on allowed roles
 * @param {string} userRole - User's role
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {boolean}
 */
export const canAccess = (userRole, allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (userRole === UserRole.ADMIN) return true;
  return allowedRoles.includes(userRole);
};

/**
 * Authentication error codes
 */
export const AuthErrorCode = {
  INVALID_CREDENTIALS: 'invalid_credentials',
  ACCOUNT_LOCKED: 'account_locked',
  ACCOUNT_DISABLED: 'account_disabled',
  EMAIL_NOT_VERIFIED: 'email_not_verified',
  PHONE_NOT_VERIFIED: 'phone_not_verified',
  TOKEN_EXPIRED: 'token_expired',
  TOKEN_INVALID: 'token_invalid',
  REFRESH_TOKEN_EXPIRED: 'refresh_token_expired',
  REFRESH_TOKEN_INVALID: 'refresh_token_invalid',
  SESSION_EXPIRED: 'session_expired',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  NETWORK_ERROR: 'network_error',
  UNKNOWN_ERROR: 'unknown_error'
};

/**
 * Authentication messages
 */
export const AuthMessage = {
  [AuthErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password',
  [AuthErrorCode.ACCOUNT_LOCKED]: 'Account has been locked. Please contact support',
  [AuthErrorCode.ACCOUNT_DISABLED]: 'Account has been disabled',
  [AuthErrorCode.EMAIL_NOT_VERIFIED]: 'Please verify your email address',
  [AuthErrorCode.PHONE_NOT_VERIFIED]: 'Please verify your phone number',
  [AuthErrorCode.TOKEN_EXPIRED]: 'Session expired. Please login again',
  [AuthErrorCode.TOKEN_INVALID]: 'Invalid session. Please login again',
  [AuthErrorCode.REFRESH_TOKEN_EXPIRED]: 'Session expired. Please login again',
  [AuthErrorCode.REFRESH_TOKEN_INVALID]: 'Invalid session. Please login again',
  [AuthErrorCode.SESSION_EXPIRED]: 'Session expired. Please login again',
  [AuthErrorCode.UNAUTHORIZED]: 'Please login to access this resource',
  [AuthErrorCode.FORBIDDEN]: 'You do not have permission to access this resource',
  [AuthErrorCode.RATE_LIMIT_EXCEEDED]: 'Too many attempts. Please try again later',
  [AuthErrorCode.NETWORK_ERROR]: 'Network error. Please check your connection',
  [AuthErrorCode.UNKNOWN_ERROR]: 'An error occurred. Please try again'
};

export default {
  UserRole,
  UserPermission,
  AuthMethod,
  AccountStatus,
  EmailVerificationStatus,
  PhoneVerificationStatus,
  TwoFactorMethod,
  SessionStatus,
  LoginType,
  DeviceType,
  RolePermissions,
  AuthErrorCode,
  AuthMessage,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissionsForRole,
  canAccess
};