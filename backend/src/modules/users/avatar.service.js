'use strict';

// backend/src/modules/users/avatar.service.js
// All avatar operations now go through Cloudinary.

const { uploadImage, deleteImage } = require('../../infrastructure/storage/imageStorage');

class AvatarService {
  // ── Upload avatar buffer to Cloudinary ───────────────────────────────────────
  async upload(file, userId) {
    if (!file?.buffer) throw new Error('No file buffer provided.');

    const result = await uploadImage(file, 'avatar', `avatar-${userId}`);
    return result.url;
  }

  // ── Delete old Cloudinary avatar ─────────────────────────────────────────────
  async deleteOldAvatar(avatarUrl) {
    if (!avatarUrl) return;
    await deleteImage(avatarUrl);
  }

  // ── Validate (called pre-upload in routes via multer, but kept for service layer) ──
  validateFile(file) {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!file) throw new Error('No file provided.');
    if (!allowed.includes(file.mimetype)) throw new Error('Invalid file type. Only JPEG, PNG, WebP, GIF are allowed.');
    if (file.size > 5 * 1024 * 1024) throw new Error('File too large. Maximum size is 5MB.');
    return true;
  }
}

module.exports = new AvatarService();
