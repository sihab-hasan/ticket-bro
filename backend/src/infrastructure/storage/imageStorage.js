'use strict';

const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');
const env = require('../../config/env');
const { BadRequestError, InternalServerError } = require('../../common/errors/AppError');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const FOLDERS = {
  AVATARS: 'ticketbro/avatars',
  EVENT_COVERS: 'ticketbro/events/covers',
  EVENT_GALLERY: 'ticketbro/events/gallery',
  CAPTURED_MOMENTS: 'ticketbro/captured-moments',
  ORGANIZER_LOGOS: 'ticketbro/organizers/logos',
  ORGANIZER_BANNERS: 'ticketbro/organizers/banners',
};

const UPLOAD_OPTIONS = {
  avatar: {
    folder: FOLDERS.AVATARS,
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto:good', fetch_format: 'auto' },
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  },
  eventCover: {
    folder: FOLDERS.EVENT_COVERS,
    transformation: [
      { width: 1200, height: 630, crop: 'fill', gravity: 'auto' },
      { quality: 'auto:good', fetch_format: 'auto' },
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
  eventGallery: {
    folder: FOLDERS.EVENT_GALLERY,
    transformation: [
      { width: 1200, crop: 'limit' },
      { quality: 'auto:good', fetch_format: 'auto' },
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
  capturedMoment: {
    folder: FOLDERS.CAPTURED_MOMENTS,
    transformation: [
      { width: 1200, crop: 'limit' },
      { quality: 'auto:good', fetch_format: 'auto' },
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
  organizerLogo: {
    folder: FOLDERS.ORGANIZER_LOGOS,
    transformation: [
      { width: 400, height: 400, crop: 'pad', background: 'auto' },
      { quality: 'auto:good', fetch_format: 'auto' },
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
  },
  organizerBanner: {
    folder: FOLDERS.ORGANIZER_BANNERS,
    transformation: [
      { width: 1500, height: 500, crop: 'fill', gravity: 'auto' },
      { quality: 'auto:good', fetch_format: 'auto' },
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
};

const LOCAL_UPLOAD_ROOT = path.join(process.cwd(), 'public/uploads');
const LOCAL_UPLOAD_PREFIX = '/uploads/';
const MIME_EXTENSION_MAP = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

const isCloudinaryConfigured = () => Boolean(
  process.env.CLOUDINARY_CLOUD_NAME
  && process.env.CLOUDINARY_API_KEY
  && process.env.CLOUDINARY_API_SECRET,
);

const ensureCloudinaryConfigured = () => {
  if (isCloudinaryConfigured()) {
    return;
  }

  throw new InternalServerError(
    'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
  );
};

const normalizeSource = (source) => {
  if (Buffer.isBuffer(source)) {
    return {
      buffer: source,
      mimetype: '',
      originalname: '',
      path: null,
    };
  }

  if (source && typeof source === 'object' && Buffer.isBuffer(source.buffer)) {
    return {
      buffer: source.buffer,
      mimetype: source.mimetype || '',
      originalname: source.originalname || '',
      path: null,
    };
  }

  if (typeof source === 'string' && source.trim()) {
    return {
      buffer: null,
      mimetype: '',
      originalname: path.basename(source),
      path: source,
    };
  }

  throw new BadRequestError('No image source provided.');
};

const sanitizeSegment = (value = '') =>
  String(value)
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'image';

const getFileExtension = ({ mimetype, originalname, path: sourcePath }) => {
  if (mimetype && MIME_EXTENSION_MAP[mimetype]) {
    return MIME_EXTENSION_MAP[mimetype];
  }

  const candidate = originalname || sourcePath || '';
  const extension = path.extname(candidate).replace('.', '').toLowerCase();
  return extension || 'jpg';
};

const buildLocalRelativePath = (type, publicId, sourceInfo) => {
  const options = UPLOAD_OPTIONS[type];
  if (!options) {
    throw new Error(`Unknown upload type: ${type}`);
  }

  const folderSegments = String(options.folder || '')
    .split('/')
    .map(sanitizeSegment)
    .filter(Boolean);
  const fileBaseName = sanitizeSegment(
    publicId || `upload-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
  );
  const extension = getFileExtension(sourceInfo);

  return path.posix.join(...folderSegments, `${fileBaseName}.${extension}`);
};

const buildLocalFilePath = (relativePath) =>
  path.join(LOCAL_UPLOAD_ROOT, ...relativePath.split('/'));

const buildLocalFileUrl = (relativePath) => {
  const baseUrl = (env.BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');
  const encodedPath = relativePath.split('/').map(encodeURIComponent).join('/');
  return `${baseUrl}${LOCAL_UPLOAD_PREFIX}${encodedPath}`;
};

const ensureDirectoryForFile = async (targetPath) => {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
};

const uploadImageLocally = async (source, type, publicId = undefined) => {
  const sourceInfo = normalizeSource(source);
  const relativePath = buildLocalRelativePath(type, publicId, sourceInfo);
  const absolutePath = buildLocalFilePath(relativePath);

  await ensureDirectoryForFile(absolutePath);

  if (sourceInfo.buffer) {
    await fs.writeFile(absolutePath, sourceInfo.buffer);
  } else if (sourceInfo.path) {
    await fs.copyFile(sourceInfo.path, absolutePath);
  } else {
    throw new BadRequestError('No image source provided.');
  }

  return {
    url: buildLocalFileUrl(relativePath),
    publicId: relativePath.replace(/\.[^.]+$/, ''),
    width: null,
    height: null,
    format: getFileExtension(sourceInfo),
  };
};

const resolveLocalUploadPath = (publicIdOrUrl) => {
  if (!publicIdOrUrl || typeof publicIdOrUrl !== 'string') {
    return null;
  }

  let uploadPath = '';

  if (publicIdOrUrl.startsWith(LOCAL_UPLOAD_PREFIX)) {
    uploadPath = publicIdOrUrl.slice(LOCAL_UPLOAD_PREFIX.length);
  } else {
    try {
      const parsedUrl = new URL(publicIdOrUrl);
      if (!parsedUrl.pathname.startsWith(LOCAL_UPLOAD_PREFIX)) {
        return null;
      }
      uploadPath = decodeURIComponent(parsedUrl.pathname.slice(LOCAL_UPLOAD_PREFIX.length));
    } catch {
      return null;
    }
  }

  const rootPath = path.resolve(LOCAL_UPLOAD_ROOT);
  const resolvedPath = path.resolve(rootPath, uploadPath.split('/').join(path.sep));

  if (!resolvedPath.startsWith(rootPath)) {
    return null;
  }

  return resolvedPath;
};

async function uploadImage(source, type, publicId = undefined) {
  if (!source) {
    throw new BadRequestError('No image source provided.');
  }

  const options = UPLOAD_OPTIONS[type];
  if (!options) {
    throw new Error(`Unknown upload type: ${type}`);
  }

  if (!isCloudinaryConfigured()) {
    return uploadImageLocally(source, type, publicId);
  }

  ensureCloudinaryConfigured();

  const normalizedSource = normalizeSource(source);
  const uploadParams = {
    ...options,
    public_id: publicId || undefined,
    overwrite: !!publicId,
    invalidate: !!publicId,
    resource_type: 'image',
  };

  let result;

  if (normalizedSource.buffer) {
    result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(uploadParams, (err, response) => {
        if (err) return reject(err);
        resolve(response);
      });
      stream.end(normalizedSource.buffer);
    });
  } else {
    result = await cloudinary.uploader.upload(normalizedSource.path, uploadParams);
  }

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
  };
}

async function deleteImage(publicIdOrUrl) {
  if (!publicIdOrUrl) return;

  const localUploadPath = resolveLocalUploadPath(publicIdOrUrl);
  if (localUploadPath) {
    try {
      await fs.unlink(localUploadPath);
    } catch (err) {
      if (err?.code !== 'ENOENT') {
        console.warn(`[Storage] Could not delete local file ${localUploadPath}:`, err.message);
      }
    }
    return;
  }

  if (!isCloudinaryConfigured()) {
    return;
  }

  let publicId = publicIdOrUrl;

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

function extractPublicId(url) {
  try {
    const parsedUrl = new URL(url);
    const parts = parsedUrl.pathname.split('/');
    const uploadIdx = parts.indexOf('upload');
    if (uploadIdx === -1) return null;

    let start = uploadIdx + 1;
    if (/^v\d+$/.test(parts[start])) start++;

    const withExt = parts.slice(start).join('/');
    return withExt.replace(/\.[^.]+$/, '');
  } catch {
    return null;
  }
}

function getThumbnailUrl(imageUrl, width = 300, height = 300) {
  if (!imageUrl || !imageUrl.includes('res.cloudinary.com')) {
    return imageUrl;
  }

  return imageUrl.replace(
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
