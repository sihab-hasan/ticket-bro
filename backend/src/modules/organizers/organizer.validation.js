'use strict';

const { Joi, optionalString, optionalUrl, paginationFields, slug, trimmedString } = require('../../common/validations/common.validation');

const socialLinksSchema = Joi.object({
  facebook: optionalUrl,
  instagram: optionalUrl,
  twitter: optionalUrl,
  youtube: optionalUrl,
}).min(1);

const updateOrganizerProfileSchema = Joi.object({
  displayName: trimmedString(2, 200).optional(),
  bio: optionalString(2000),
  website: optionalUrl,
  phone: optionalString(30),
  email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).empty('').optional(),
  socialLinks: socialLinksSchema.optional(),
}).min(1);

const submitVerificationSchema = Joi.object({
  verificationDoc: trimmedString(3, 2048).required(),
  verificationNotes: optionalString(2000),
});

const organizerSlugParamsSchema = Joi.object({
  slug: slug.required(),
});

const organizerEventsQuerySchema = Joi.object({
  ...paginationFields,
  search: optionalString(150),
});

const organizerDashboardQuerySchema = Joi.object({
  ...paginationFields,
  status: optionalString(50),
  eventId: Joi.string().trim().hex().length(24).optional(),
  search: optionalString(150),
});

module.exports = {
  updateOrganizerProfileSchema,
  submitVerificationSchema,
  organizerSlugParamsSchema,
  organizerEventsQuerySchema,
  organizerDashboardQuerySchema,
};
