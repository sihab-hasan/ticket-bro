/**
 * OrganizerImageManager.jsx
 *
 * Manages logo and banner image uploads for an organizer profile.
 * Used inside the organizer profile edit page.
 *
 * Props:
 *   organizer   {object}  Current organizer object (.logo, .coverImage)
 *   onUpdated   {fn}      Called with updated organizer after any change
 *   isLoading   {boolean}
 */
import React, { useState } from "react";
import Upload from "@/components/shared/ImageUpload";
import organizersService from "@/api/organizers.api";
import { Building2, Image as ImageIcon } from "lucide-react";

const OrganizerImageManager = ({ organizer, onUpdated, isLoading = false }) => {
  const [uploadingLogo,   setUploadingLogo]   = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // ── Logo ──────────────────────────────────────────────────────────────────
  const handleLogoUpload = async (file) => {
    setUploadingLogo(true);
    try {
      const updated = await organizersService.uploadLogo(file);
      onUpdated?.(updated);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleLogoRemove = async () => {
    setUploadingLogo(true);
    try {
      const updated = await organizersService.removeLogo();
      onUpdated?.(updated);
    } finally {
      setUploadingLogo(false);
    }
  };

  // ── Banner ────────────────────────────────────────────────────────────────
  const handleBannerUpload = async (file) => {
    setUploadingBanner(true);
    try {
      const updated = await organizersService.uploadBanner(file);
      onUpdated?.(updated);
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleBannerRemove = async () => {
    setUploadingBanner(true);
    try {
      const updated = await organizersService.removeBanner();
      onUpdated?.(updated);
    } finally {
      setUploadingBanner(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Logo ── */}
      <div className="bg-card rounded-2xl p-5 space-y-4">
        <div className="pb-3 border-b border-border">
          <h3 className="text-sm font-bold text-foreground font-heading flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            Organizer Logo
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Shown next to your name on event pages and your public profile. Square image recommended.
          </p>
        </div>

        <Upload
          currentUrl={organizer?.logo || null}
          onUpload={handleLogoUpload}
          onRemove={organizer?.logo ? handleLogoRemove : undefined}
          isUploading={uploadingLogo || isLoading}
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          shape="logo"
          maxSizeMB={5}
          label="Upload logo"
          hint="JPEG, PNG, WebP or SVG · Max 5 MB · 400 × 400 px recommended"
        />
      </div>

      {/* ── Banner ── */}
      <div className="bg-card rounded-2xl p-5 space-y-4">
        <div className="pb-3 border-b border-border">
          <h3 className="text-sm font-bold text-foreground font-heading flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" />
            Profile Banner
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Wide banner displayed at the top of your public organizer profile page. Recommended: 1500 × 500 px.
          </p>
        </div>

        <Upload
          currentUrl={organizer?.coverImage || null}
          onUpload={handleBannerUpload}
          onRemove={organizer?.coverImage ? handleBannerRemove : undefined}
          isUploading={uploadingBanner || isLoading}
          accept="image/jpeg,image/png,image/webp"
          shape="banner"
          maxSizeMB={10}
          label="Upload banner"
          hint="JPEG, PNG, or WebP · Max 10 MB · 1500 × 500 px recommended"
        />
      </div>

    </div>
  );
};

export default OrganizerImageManager;
