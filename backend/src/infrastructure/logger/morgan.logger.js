'use strict';
const morgan = require('morgan');
const logger = require('./winston.logger');

const stream = { write: (msg) => logger.http(msg.trim()) };
const morganMiddleware = morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream });
module.exports = morganMiddleware;
