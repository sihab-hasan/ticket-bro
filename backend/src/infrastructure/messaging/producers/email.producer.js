'use strict';

const logger = require('../../logger/logger');
const { processTemplateEmail } = require('../consumers/email.consumer');

const enqueueTemplateEmail = async (payload) => {
  setImmediate(async () => {
    try {
      await processTemplateEmail(payload);
    } catch (error) {
      logger.error(`Queued email failed [template: ${payload?.templateName || 'unknown'}]: ${error.message}`);
    }
  });

  return {
    queued: true,
    templateName: payload?.templateName || null,
    to: payload?.to || null,
  };
};

module.exports = {
  enqueueTemplateEmail,
};
