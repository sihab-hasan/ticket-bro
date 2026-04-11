/**
 * EventImageManager.jsx
 *
 * Provides cover image and gallery image management for an event.
 * Used inside the event edit / create flow by organizers.
 *
 * Props:
 *   event        {object}  The current event object (needs .slug, .coverImage, .images)
 *   onUpdated    {fn}      Called with the updated event object after any upload/delete
 *   isLoading    {boolean}
 */
import React, { useState } from "react";
import Upload from "@/components/shared/ImageUpload";
import { uploadCoverImage, removeCoverImage, uploadGalleryImages, removeGalleryImage } from "@/api/events.api";
import { Image as ImageIcon } from "lucide-react";

const EventImageManager = ({ event, onUpdated, isLoading = false }) => {
  const [uploadingCover,   setUploadingCover]   = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [removingUrl,      setRemovingUrl]      = useState(null); // URL being removed

  if (!event?.slug) return null;

  const galleryImages = Array.isArray(event.images) ? event.images : [];
  const remainingSlots = Math.max(0, 10 - galleryImages.length);

  // ── Cover ─────────────────────────────────────────────────────────────────
  const handleCoverUpload = async (file) => {
    setUploadingCover(true);
    try {
      const updated = await uploadCoverImage(event.slug, file);
      onUpdated?.(updated);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleCoverRemove = async () => {
    setUploadingCover(true);
    try {
      const updated = await removeCoverImage(event.slug);
      onUpdated?.(updated);
    } finally {
      setUploadingCover(false);
    }
  };

  // ── Gallery ───────────────────────────────────────────────────────────────
  const handleGalleryUpload = async (files) => {
    setUploadingGallery(true);
    try {
      const selectedFiles = Array.isArray(files) ? files : [files];

      if (selectedFiles.length > remainingSlots) {
        throw new Error(
          remainingSlots > 0
            ? `You can upload ${remainingSlots} more gallery image${remainingSlots === 1 ? "" : "s"}.`
            : "This event already has the maximum of 10 gallery images.",
        );
      }

      const updated = await uploadGalleryImages(event.slug, selectedFiles);
      onUpdated?.(updated);
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleGalleryRemove = async (url) => {
    setRemovingUrl(url);
    try {
      const updated = await removeGalleryImage(event.slug, url);
      onUpdated?.(updated);
    } finally {
      setRemovingUrl(null);
    }
  };
  return (
    <div className="space-y-6">
      {/* ── Cover image ── */}
      <div className="bg-card rounded-2xl p-5 space-y-4">
        <div className="pb-3 border-b border-border">
          <h3 className="text-sm font-bold text-foreground font-heading flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" />
            Cover Image
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            The main image shown in event listings and the event detail page. Recommended: 1200 × 630 px.
          </p>
        </div>

        <Upload
          currentUrl={event.coverImage || null}
          onUpload={handleCoverUpload}
          onRemove={event.coverImage ? handleCoverRemove : undefined}
          isUploading={uploadingCover || isLoading}
          accept="image/jpeg,image/png,image/webp"
          shape="banner"
          maxSizeMB={10}
          label="Upload cover image"
          hint="JPEG, PNG, or WebP · Max 10 MB · 1200 × 630 px recommended"
        />
      </div>

      {/* ── Gallery ── */}
      <div className="bg-card rounded-2xl p-5 space-y-4">
        <div className="pb-3 border-b border-border">
          <h3 className="text-sm font-bold text-foreground font-heading flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" />
            Gallery Images
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Additional images shown on the event detail page. Upload up to 10 images.
          </p>
        </div>

        <Upload
          currentItems={galleryImages.map((url, index) => ({
            id: url,
            url,
            alt: `Gallery ${index + 1}`,
          }))}
          onRemoveItem={handleGalleryRemove}
          removingItemKey={removingUrl}
          onUpload={remainingSlots > 0 ? handleGalleryUpload : undefined}
          isUploading={uploadingGallery || isLoading}
          accept="image/jpeg,image/png,image/webp"
          multiple={true}
          maxFiles={remainingSlots || null}
          maxSizeMB={10}
          shape="square"
          disabled={remainingSlots === 0}
          label={
            remainingSlots > 0
              ? `Add gallery images (${galleryImages.length}/10)`
              : "Gallery is full"
          }
          hint={
            remainingSlots > 0
              ? `JPEG, PNG, or WebP · Max 10 MB each · Up to ${remainingSlots} more`
              : "Maximum of 10 gallery images reached. Remove an image to add a new one."
          }
        />
      </div>
    </div>
  );
};

export default EventImageManager;
