'use strict';
const { ROLES } = require('../common/constants/roles');
const permissions = {
  events:   { create: [ROLES.ORGANIZER, ROLES.ADMIN, ROLES.SUPER_ADMIN], delete: [ROLES.ADMIN, ROLES.SUPER_ADMIN] },
  users:    { manage: [ROLES.ADMIN, ROLES.SUPER_ADMIN] },
  payouts:  { approve: [ROLES.ADMIN, ROLES.SUPER_ADMIN] },
  reports:  { resolve: [ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN] },
};
module.exports = permissions;
