'use strict';
// imageProcessor — Cloudinary handles all transformations server-side.
// getThumbnailUrl generates on-the-fly transformations via URL manipulation.
const { getThumbnailUrl } = require('./imageStorage');
module.exports = { getThumbnailUrl };
