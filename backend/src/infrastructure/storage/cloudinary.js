'use strict';

/**
 * Cloudinary configuration and helper utilities
 * All image uploads for TicketBro go through this module.
 */

const { v2: cloudinary } = require('cloudinary');
const { BadRequestError, InternalServerError } = require('../../common/errors/AppError');

// ── Configure once at module load ─────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

// ── Folder constants ──────────────────────────────────────────────────────────
const FOLDERS = {
  AVATARS:          'ticketbro/avatars',
  EVENT_COVERS:     'ticketbro/events/covers',
  EVENT_GALLERY:    'ticketbro/events/gallery',
  CAPTURED_MOMENTS: 'ticketbro/captured-moments',
  ORGANIZER_LOGOS:  'ticketbro/organizers/logos',
  ORGANIZER_BANNERS:'ticketbro/organizers/banners',
};

// ── Upload presets per context ────────────────────────────────────────────────
const UPLOAD_OPTIONS = {
  avatar: {
    folder:         FOLDERS.AVATARS,
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto:good', fetch_format: 'auto' },
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  },
  eventCover: {
    folder:         FOLDERS.EVENT_COVERS,
    transformation: [
      { width: 1200, height: 630, crop: 'fill', gravity: 'auto' },
      { quality: 'auto:good', fetch_format: 'auto' },
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
  eventGallery: {
    folder:         FOLDERS.EVENT_GALLERY,
    transformation: [
      { width: 1200, crop: 'limit' },
      { quality: 'auto:good', fetch_format: 'auto' },
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
  capturedMoment: {
    folder:         FOLDERS.CAPTURED_MOMENTS,
    transformation: [
      { width: 1200, crop: 'limit' },
      { quality: 'auto:good', fetch_format: 'auto' },
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
  organizerLogo: {
    folder:         FOLDERS.ORGANIZER_LOGOS,
    transformation: [
      { width: 400, height: 400, crop: 'pad', background: 'auto' },
      { quality: 'auto:good', fetch_format: 'auto' },
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
  },
  organizerBanner: {
    folder:         FOLDERS.ORGANIZER_BANNERS,
    transformation: [
      { width: 1500, height: 500, crop: 'fill', gravity: 'auto' },
      { quality: 'auto:good', fetch_format: 'auto' },
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
};

const ensureCloudinaryConfigured = () => {
  if (
    process.env.CLOUDINARY_CLOUD_NAME
    && process.env.CLOUDINARY_API_KEY
    && process.env.CLOUDINARY_API_SECRET
  ) {
    return;
  }

  throw new InternalServerError(
    'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
  );
};

// ── Upload a Buffer or local file path ────────────────────────────────────────
/**
 * @param {Buffer|string} source  - Buffer (from multer memoryStorage) or file path
 * @param {string}        type    - Key from UPLOAD_OPTIONS
 * @param {string}        [publicId] - Optional explicit public_id (e.g. to overwrite)
 * @returns {Promise<{url: string, publicId: string, width: number, height: number}>}
 */
async function uploadImage(source, type, publicId = undefined) {
  ensureCloudinaryConfigured();

  if (!source) {
    throw new BadRequestError('No image source provided.');
  }

  const opts = UPLOAD_OPTIONS[type];
  if (!opts) throw new Error(`Unknown upload type: ${type}`);

  const uploadParams = {
    ...opts,
    public_id:      publicId || undefined,
    overwrite:      !!publicId,
    invalidate:     !!publicId,
    resource_type:  'image',
  };

  let result;
  if (Buffer.isBuffer(source)) {
    // memoryStorage: wrap in a promise using upload_stream
    result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(uploadParams, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
      stream.end(source);
    });
  } else {
    // file path string
    result = await cloudinary.uploader.upload(source, uploadParams);
  }

  return {
    url:      result.secure_url,
    publicId: result.public_id,
    width:    result.width,
    height:   result.height,
    format:   result.format,
  };
}

// ── Delete by public_id ───────────────────────────────────────────────────────
/**
 * Safely delete a Cloudinary asset. Never throws — logs warnings only.
 * @param {string} publicIdOrUrl - Cloudinary public_id OR a full secure_url
 */
async function deleteImage(publicIdOrUrl) {
  ensureCloudinaryConfigured();

  if (!publicIdOrUrl) return;

  let publicId = publicIdOrUrl;

  // If it looks like a URL, extract the public_id
  if (publicIdOrUrl.startsWith('http')) {
    publicId = extractPublicId(publicIdOrUrl);
    if (!publicId) return;
  }

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
  } catch (err) {
    console.warn(`[Cloudinary] Could not delete ${publicId}:`, err.message);
  }
}

// ── Extract public_id from a Cloudinary URL ───────────────────────────────────
/**
 * Given "https://res.cloudinary.com/<cloud>/image/upload/v123/<folder>/<name>.jpg"
 * returns "<folder>/<name>"
 */
function extractPublicId(url) {
  try {
    const u = new URL(url);
    // pathname: /demo/image/upload/v123456/ticketbro/avatars/xyz.jpg
    const parts = u.pathname.split('/');
    const uploadIdx = parts.indexOf('upload');
    if (uploadIdx === -1) return null;
    // skip version segment if present (starts with 'v' followed by digits)
    let start = uploadIdx + 1;
    if (/^v\d+$/.test(parts[start])) start++;
    // join remaining parts, strip extension
    const withExt = parts.slice(start).join('/');
    return withExt.replace(/\.[^.]+$/, '');
  } catch {
    return null;
  }
}

// ── Generate a thumbnail URL on the fly (no re-upload) ────────────────────────
function getThumbnailUrl(cloudinaryUrl, width = 300, height = 300) {
  if (!cloudinaryUrl || !cloudinaryUrl.includes('res.cloudinary.com')) {
    return cloudinaryUrl;
  }
  return cloudinaryUrl.replace(
    '/upload/',
    `/upload/w_${width},h_${height},c_fill,q_auto,f_auto/`,
  );
}

module.exports = {
  cloudinary,
  FOLDERS,
  UPLOAD_OPTIONS,
  uploadImage,
  deleteImage,
  extractPublicId,
  getThumbnailUrl,
};
