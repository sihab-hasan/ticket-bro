'use strict';

/**
 * upload.middleware.js  –  Centralized multer middleware using memoryStorage
 *
 * All file uploads land in memory (no temp disk writes), then flow directly
 * to Cloudinary via uploadImage().
 *
 * Usage:
 *   router.post('/me/avatar', uploadMiddleware.avatar, controller.uploadAvatar);
 *   router.post('/events',    uploadMiddleware.eventImages, controller.createEvent);
 */

const multer = require('multer');

// ── Allowed MIME types ────────────────────────────────────────────────────────
const RASTER_IMAGE_MIMES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

const SVG_IMAGE_MIMES = [
  'image/svg+xml',
];

// ── In-memory storage (no disk temp files) ────────────────────────────────────
const memStorage = multer.memoryStorage();

// ── File filter factory ───────────────────────────────────────────────────────
const makeFilter = (allowedMimes = RASTER_IMAGE_MIMES) =>
  (_req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        Object.assign(new Error(`Invalid file type: ${file.mimetype}. Only images are allowed.`), {
          code: 'INVALID_FILE_TYPE',
        }),
        false,
      );
    }
  };

// ── Multer error handler wrapper ──────────────────────────────────────────────
function withErrorHandling(multerFn) {
  return (req, res, next) => {
    multerFn(req, res, (err) => {
      if (!err) return next();
      if (err instanceof multer.MulterError) {
        const message =
          err.code === 'LIMIT_FILE_SIZE'
            ? 'File too large. Maximum size exceeded.'
            : err.message;
        return res.status(400).json({ status: 'fail', message });
      }
      if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({ status: 'fail', message: err.message });
      }
      next(err);
    });
  };
}

// ── Pre-built middleware exports ──────────────────────────────────────────────

const avatarUpload = multer({ storage: memStorage, fileFilter: makeFilter(RASTER_IMAGE_MIMES), limits: { fileSize: 5 * 1024 * 1024 } });
exports.avatar = withErrorHandling(avatarUpload.single('avatar'));

const eventCoverUpload = multer({ storage: memStorage, fileFilter: makeFilter(RASTER_IMAGE_MIMES), limits: { fileSize: 10 * 1024 * 1024 } });
exports.eventCover = withErrorHandling(eventCoverUpload.single('coverImage'));

const eventGalleryUpload = multer({ storage: memStorage, fileFilter: makeFilter(RASTER_IMAGE_MIMES), limits: { fileSize: 10 * 1024 * 1024 } });
exports.eventGallery = withErrorHandling(eventGalleryUpload.array('images', 10));

const capturedMomentUpload = multer({ storage: memStorage, fileFilter: makeFilter(RASTER_IMAGE_MIMES), limits: { fileSize: 8 * 1024 * 1024 } });
exports.capturedMomentImages = withErrorHandling(capturedMomentUpload.array('images', 6));

const eventFullUpload = multer({ storage: memStorage, fileFilter: makeFilter(RASTER_IMAGE_MIMES), limits: { fileSize: 10 * 1024 * 1024 } });
exports.eventFull = withErrorHandling(
  eventFullUpload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'images',     maxCount: 10 },
  ]),
);

const organizerLogoUpload = multer({
  storage: memStorage,
  fileFilter: makeFilter([...RASTER_IMAGE_MIMES, ...SVG_IMAGE_MIMES]),
  limits: { fileSize: 5 * 1024 * 1024 },
});
exports.organizerLogo = withErrorHandling(organizerLogoUpload.single('logo'));

const organizerBannerUpload = multer({ storage: memStorage, fileFilter: makeFilter(RASTER_IMAGE_MIMES), limits: { fileSize: 10 * 1024 * 1024 } });
exports.organizerBanner = withErrorHandling(organizerBannerUpload.single('banner'));

const organizerFullUpload = multer({
  storage: memStorage,
  fileFilter: makeFilter([...RASTER_IMAGE_MIMES, ...SVG_IMAGE_MIMES]),
  limits: { fileSize: 10 * 1024 * 1024 },
});
exports.organizerFull = withErrorHandling(
  organizerFullUpload.fields([
    { name: 'logo',   maxCount: 1 },
    { name: 'banner', maxCount: 1 },
  ]),
);
