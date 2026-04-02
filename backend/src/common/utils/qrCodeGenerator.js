'use strict';
const QRCode = require('qrcode');

const generateQR = async (data, opts = {}) => {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return QRCode.toDataURL(str, { errorCorrectionLevel: 'H', width: 256, ...opts });
};

const generateQRBuffer = async (data, opts = {}) => {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return QRCode.toBuffer(str, { errorCorrectionLevel: 'H', ...opts });
};

module.exports = { generateQR, generateQRBuffer };
