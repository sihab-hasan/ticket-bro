'use strict';

module.exports = [
  { path: 'organizer', select: 'firstName lastName email avatar organizationName' },
  { path: 'coOrganizers', select: 'firstName lastName email avatar organizationName' },
  {
    path: 'organizerProfile',
    select: 'user displayName slug bio logo coverImage website phone email socialLinks verificationStatus eventCount',
  },
  { path: 'category', select: 'name slug' },
  { path: 'subcategory', select: 'name slug category' },
  { path: 'eventType', select: 'name slug' },
  { path: 'tags', select: 'name slug' },
];
