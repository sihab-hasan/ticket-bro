'use strict';

/**
 * event.image.service.js
 * Handles all Cloudinary image operations for events:
 *   - coverImage upload / replace
 *   - gallery images upload (up to 10)
 *   - individual gallery image delete
 *   - delete all images when event is deleted
 */

const { uploadImage, deleteImage } = require('../../infrastructure/storage/cloudinary');

class EventImageService {
  /**
   * Upload (or replace) the cover image for an event.
   * Uses a stable public_id so the CDN URL stays the same on re-upload.
   * @param {Buffer}  buffer    multer memoryStorage buffer
   * @param {string}  eventId   MongoDB _id string
   * @returns {Promise<string>} Cloudinary secure_url
   */
  async uploadCover(buffer, eventId) {
    if (!buffer) throw new Error('No file buffer provided for cover image.');
    const result = await uploadImage(buffer, 'eventCover', `cover-${eventId}`);
    return result.url;
  }

  /**
   * Upload multiple gallery images for an event.
   * Each gets a unique public_id using a timestamp suffix.
   * @param {Buffer[]} buffers  Array of multer buffer objects: [{ buffer, originalname, mimetype }]
   * @param {string}   eventId
   * @returns {Promise<string[]>} Array of Cloudinary secure_urls
   */
  async uploadGallery(buffers, eventId) {
    if (!buffers || buffers.length === 0) return [];
    const uploads = buffers.map((file, i) =>
      uploadImage(file.buffer, 'eventGallery', `gallery-${eventId}-${Date.now()}-${i}`)
    );
    const results = await Promise.all(uploads);
    return results.map((r) => r.url);
  }

  /**
   * Delete the cover image from Cloudinary.
   * Safe to call with null/undefined — does nothing.
   */
  async deleteCover(coverUrl) {
    if (!coverUrl) return;
    await deleteImage(coverUrl);
  }

  /**
   * Delete all gallery images from Cloudinary.
   * @param {string[]} imageUrls
   */
  async deleteGallery(imageUrls = []) {
    await Promise.all(imageUrls.map((url) => deleteImage(url)));
  }

  /**
   * Delete a single gallery image by URL.
   */
  async deleteGalleryImage(imageUrl) {
    if (!imageUrl) return;
    await deleteImage(imageUrl);
  }

  /**
   * Delete ALL images belonging to an event (cover + gallery).
   * Called when an event is hard-deleted.
   */
  async deleteAllEventImages(event) {
    const tasks = [];
    if (event?.coverImage) tasks.push(deleteImage(event.coverImage));
    if (Array.isArray(event?.images)) {
      event.images.forEach((url) => tasks.push(deleteImage(url)));
    }
    await Promise.all(tasks);
  }
}

module.exports = new EventImageService();
