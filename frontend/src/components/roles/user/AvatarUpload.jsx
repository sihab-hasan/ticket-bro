/**
 * AvatarUpload.jsx
 *
 * Dialog-based avatar upload using the shared Upload component.
 * Dispatches Redux thunks for upload/remove and syncs authSlice.
 */
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDispatch, useSelector } from "react-redux";
import {
  uploadAvatar,
  removeAvatar,
  selectUploading,
} from "@/store/slices/userSlice";
import { updateUser } from "@/store/slices/authSlice";
import Upload from "@/components/shared/ImageUpload";

// ── Component ─────────────────────────────────────────────────────────────────
const AvatarUpload = ({ user, open, onOpenChange }) => {
  const dispatch    = useDispatch();
  const isUploading = useSelector(selectUploading);

  const handleUpload = async (file) => {
    const result = await dispatch(uploadAvatar(file));
    if (uploadAvatar.fulfilled.match(result)) {
      dispatch(updateUser(result.payload));
      onOpenChange(false);
    } else {
      throw new Error(result.payload || "Failed to upload avatar.");
    }
  };

  const handleRemove = async () => {
    const result = await dispatch(removeAvatar());
    if (removeAvatar.fulfilled.match(result)) {
      dispatch(updateUser(result.payload));
      onOpenChange(false);
    } else {
      throw new Error(result.payload || "Failed to remove avatar.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-card border-none">
        <DialogHeader>
          <DialogTitle>Change Profile Picture</DialogTitle>
          <DialogDescription>
            Upload a new profile picture or remove the current one.
          </DialogDescription>
        </DialogHeader>

        {/* Upload widget */}
        <Upload
          currentUrl={user?.avatar}
          onUpload={handleUpload}
          onRemove={user?.avatar ? handleRemove : undefined}
          isUploading={isUploading}
          accept="image/jpeg,image/png,image/webp,image/gif"
          shape="circle"
          maxSizeMB={5}
          label="Choose new photo"
          hint="JPEG, PNG, WebP or GIF · Max 5 MB"
        />
      </DialogContent>
    </Dialog>
  );
};

export default AvatarUpload;
