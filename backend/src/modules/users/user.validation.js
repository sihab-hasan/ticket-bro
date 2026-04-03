'use strict';

const Joi = require('joi');
const { ROLES } = require('../../common/constants/roles');

const phoneSchema = Joi.string()
  .trim()
  .pattern(/^\+?[\d\s\-()]{7,20}$/)
  .messages({ 'string.pattern.base': 'Please provide a valid phone number' });

const addressSchema = Joi.object({
  street: Joi.string().trim().max(120).allow('', null),
  city: Joi.string().trim().max(80).allow('', null),
  state: Joi.string().trim().max(80).allow('', null),
  country: Joi.string().trim().max(80).allow('', null),
  postalCode: Joi.string().trim().max(30).allow('', null),
});

const mongoIdParamSchema = Joi.object({
  userId: Joi.string().hex().length(24).required().messages({
    'string.length': 'User id must be a valid identifier',
    'any.required': 'User id is required',
  }),
});

const sessionIdParamSchema = Joi.object({
  sessionId: Joi.string().hex().length(24).required().messages({
    'string.length': 'Session id must be a valid identifier',
    'any.required': 'Session id is required',
  }),
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50),
  lastName: Joi.string().trim().min(2).max(50),
  phone: phoneSchema.allow('', null),
  bio: Joi.string().trim().max(500).allow('', null),
  dateOfBirth: Joi.date().max('now').allow(null),
  address: addressSchema,
}).min(1);

const adminUpdateUserSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50),
  lastName: Joi.string().trim().min(2).max(50),
  phone: phoneSchema.allow('', null),
  bio: Joi.string().trim().max(500).allow('', null),
  dateOfBirth: Joi.date().max('now').allow(null),
  address: addressSchema,
  avatar: Joi.string().trim().uri().allow('', null),
  status: Joi.string().valid('active', 'inactive', 'suspended', 'banned'),
  statusReason: Joi.string().trim().max(500).allow('', null),
  isEmailVerified: Joi.boolean(),
}).min(1);

const statusReasonSchema = Joi.object({
  reason: Joi.string().trim().max(500).allow('', null),
});

const changeRoleSchema = Joi.object({
  role: Joi.string()
    .valid(...Object.values(ROLES))
    .required()
    .messages({ 'any.required': 'Role is required' }),
});

const userListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  role: Joi.string().valid(...Object.values(ROLES)),
  status: Joi.string().valid('active', 'inactive', 'suspended', 'banned'),
  search: Joi.string().trim().max(100).allow(''),
  isActive: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('true', 'false')),
  sort: Joi.string().trim().max(50),
});

module.exports = {
  updateProfileSchema,
  adminUpdateUserSchema,
  statusReasonSchema,
  changeRoleSchema,
  userListQuerySchema,
  mongoIdParamSchema,
  sessionIdParamSchema,
};
