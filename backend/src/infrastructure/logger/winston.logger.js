'use strict';
const { createLogger, transports, format } = require('winston');
const loggerConfig = require('../../config/logger.config');

const logger = createLogger({
  level: loggerConfig.level,
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    process.env.NODE_ENV === 'production' ? format.json() : format.combine(format.colorize(), format.simple()),
  ),
  transports: [
    new transports.Console(),
    ...(process.env.NODE_ENV === 'production'
      ? [new transports.File({ filename: loggerConfig.logFile, maxsize: 10*1024*1024, maxFiles: 5 })]
      : []),
  ],
});

module.exports = logger;
