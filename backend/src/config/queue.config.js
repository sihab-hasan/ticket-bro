'use strict';
module.exports = {
  redis:       process.env.REDIS_URL || null,
  defaultOpts: { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
};
