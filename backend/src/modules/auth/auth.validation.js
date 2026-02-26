'use strict';

const Joi = require('joi');
const authConfig = require('../../config/auth.config');
const { ROLES } = require('../../common/constants/roles');

const passwordSchema = Joi.string()
  .min(authConfig.password.minLength)
  .max(authConfig.password.maxLength)
  .pattern(authConfig.password.pattern)
  .messages({
    'string.min': `Password must be at least ${authConfig.password.minLength} characters`,
    'string.max': `Password cannot exceed ${authConfig.password.maxLength} characters`,
    'string.pattern.base': authConfig.password.patternMessage,
    'any.required': 'Password is required',
  });

const registerSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required().messages({
    'string.min': 'First name must be at least 2 characters',
    'string.max': 'First name cannot exceed 50 characters',
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().trim().min(2).max(50).required().messages({
    'string.min': 'Last name must be at least 2 characters',
    'string.max': 'Last name cannot exceed 50 characters',
    'any.required': 'Last name is required',
  }),
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: passwordSchema.required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required',
    }),
  phone: Joi.string()
    .pattern(/^\+?[\d\s\-()]{7,20}$/)
    .optional()
    .messages({ 'string.pattern.base': 'Please provide a valid phone number' }),
  role: Joi.string()
    .valid(ROLES.USER, ROLES.ORGANIZER)
    .default(ROLES.USER)
    .optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
  rememberMe: Joi.boolean().default(false).optional(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required',
  }),
  password: passwordSchema.required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required',
    }),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
  }),
  newPassword: passwordSchema.required(),
  confirmNewPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'New passwords do not match',
      'any.required': 'New password confirmation is required',
    }),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required',
  }),
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Verification token is required',
  }),
});

const resendVerificationSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim().required(),
});

const verifyOTPSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim().required(),
  otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    'string.length': 'OTP must be 6 digits',
    'string.pattern.base': 'OTP must contain only digits',
    'any.required': 'OTP is required',
  }),
});

const twoFactorVerifySchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': '2FA token is required',
  }),
});

const validate = (schema) => (data) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message,
    }));
    return { isValid: false, errors, value: null };
  }

  return { isValid: true, errors: null, value };
};

module.exports = {
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
  validateForgotPassword: validate(forgotPasswordSchema),
  validateResetPassword: validate(resetPasswordSchema),
  validateChangePassword: validate(changePasswordSchema),
  validateRefreshToken: validate(refreshTokenSchema),
  validateVerifyEmail: validate(verifyEmailSchema),
  validateResendVerification: validate(resendVerificationSchema),
  validateVerifyOTP: validate(verifyOTPSchema),
  validateTwoFactorVerify: validate(twoFactorVerifySchema),
};
