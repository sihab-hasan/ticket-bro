'use strict';

const emailService = require('../../mail/emailService');

const processTemplateEmail = async (payload) => {
  return emailService.sendTemplateEmail(payload);
};

module.exports = {
  processTemplateEmail,
};
