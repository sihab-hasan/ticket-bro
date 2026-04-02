'use strict';
module.exports = {
  level:    process.env.LOG_LEVEL  || 'info',
  format:   process.env.LOG_FORMAT || 'json',
  logFile:  process.env.LOG_FILE   || 'logs/app.log',
};
