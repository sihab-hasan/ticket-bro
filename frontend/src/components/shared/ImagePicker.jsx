import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Crop,
  GripVertical,
  ImagePlus,
  Images,
  Loader2,
  RefreshCcw,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageCropModal from "@/components/shared/ImageCropModal";
import { cn } from "@/lib/utils";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const buildRemoteFileName = (fallbackName = "image.jpg", mimeType = "image/jpeg") => {
  const extension = mimeType === "image/png" ? "png" : "jpg";
  const base = fallbackName.includes(".")
    ? fallbackName.slice(0, fallbackName.lastIndexOf("."))
    : fallbackName;
  return `${base}.${extension}`;
};

const readRemoteImageAsFile = async (url, fallbackName) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("We couldn't load that image for cropping.");
  }

  const blob = await response.blob();
  return new File(
    [blob],
    buildRemoteFileName(fallbackName, blob.type),
    {
      type: blob.type || "image/jpeg",
      lastModified: Date.now(),
    },
  );
};

const validateImageFiles = (files = []) => {
  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      throw new Error(
        `"${file.name}" is not supported. Please use JPEG, PNG, or WebP images.`,
      );
    }

    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error(`"${file.name}" is larger than 10 MB.`);
    }
  }
};

const ImagePicker = ({
  disabled = false,
  imageState,
}) => {
  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [draggedGalleryId, setDraggedGalleryId] = useState(null);
  const [cropState, setCropState] = useState(null);
  const [error, setError] = useState("");
  const [preparingCropKey, setPreparingCropKey] = useState("");

  const coverPreviewUrl = imageState?.cover?.previewUrl;
  const galleryItems = imageState?.galleryItems || [];

  useEffect(
    () => () => {
      if (cropState?.revokeOnClose && cropState.sourceUrl) {
        URL.revokeObjectURL(cropState.sourceUrl);
      }
    },
    [cropState],
  );

  const closeCropModal = () => {
    if (cropState?.revokeOnClose && cropState.sourceUrl) {
      URL.revokeObjectURL(cropState.sourceUrl);
    }
    setCropState(null);
  };

  const handleCoverSelection = (event) => {
    const [file] = Array.from(event.target.files || []);
    event.target.value = "";

    if (!file) {
      return;
    }

    setError("");
    try {
      validateImageFiles([file]);
    } catch (selectionError) {
      setError(selectionError?.message || "Couldn't use that cover image.");
      return;
    }
    const sourceUrl = URL.createObjectURL(file);

    setCropState({
      kind: "cover",
      itemId: "cover",
      sourceUrl,
      fileName: file.name,
      mimeType: file.type,
      revokeOnClose: true,
      title: "Crop cover image",
      description:
        "Use a wide crop for the main listing image. The exported file is saved at 1200 × 630.",
      aspectRatio: 16 / 9,
      outputWidth: 1200,
      outputHeight: 630,
    });
  };

  const handleGallerySelection = (event) => {
    const nextFiles = Array.from(event.target.files || []);
    event.target.value = "";

    if (!nextFiles.length) {
      return;
    }

    setError("");

    try {
      validateImageFiles(nextFiles);
      imageState?.addGalleryFiles(nextFiles);
    } catch (selectionError) {
      setError(selectionError?.message || "Couldn't add those gallery images.");
    }
  };

  const prepareCropForItem = async ({ item, kind }) => {
    if (!item) {
      return;
    }

    setError("");
    setPreparingCropKey(item.id || kind);

    try {
      if (item.kind === "new" && item.previewUrl) {
        setCropState({
          kind,
          itemId: item.id,
          sourceUrl: item.previewUrl,
          fileName: item.name,
          mimeType: item.uploadFile?.type || "image/jpeg",
          revokeOnClose: false,
          title: kind === "cover" ? "Crop cover image" : "Crop gallery image",
          description:
            kind === "cover"
              ? "Adjust the cover before it is uploaded."
              : "Crop the gallery image and keep it in your current order.",
          aspectRatio: kind === "cover" ? 16 / 9 : null,
          outputWidth: kind === "cover" ? 1200 : undefined,
          outputHeight: kind === "cover" ? 630 : undefined,
        });
        return;
      }

      const remoteFile = await readRemoteImageAsFile(
        item.remoteUrl || item.previewUrl,
        item.name,
      );
      const localUrl = URL.createObjectURL(remoteFile);

      setCropState({
        kind,
        itemId: item.id,
        sourceUrl: localUrl,
        fileName: remoteFile.name,
        mimeType: remoteFile.type,
        revokeOnClose: true,
        title: kind === "cover" ? "Crop cover image" : "Crop gallery image",
        description:
          kind === "cover"
            ? "Replace the current cover with a cropped version."
            : "Replace the current gallery image with a cropped version.",
        aspectRatio: kind === "cover" ? 16 / 9 : null,
        outputWidth: kind === "cover" ? 1200 : undefined,
        outputHeight: kind === "cover" ? 630 : undefined,
      });
    } catch (cropError) {
      setError(cropError?.message || "Couldn't open the crop tool.");
    } finally {
      setPreparingCropKey("");
    }
  };

  const handleCropApply = async (croppedFile) => {
    if (!cropState || !croppedFile) {
      return;
    }

    if (cropState.kind === "cover") {
      imageState?.replaceCoverFile(croppedFile);
      return;
    }

    imageState?.replaceGalleryItemFile(cropState.itemId, croppedFile);
  };

  const summaryItems = useMemo(() => {
    const items = [];
    if (imageState?.cover?.kind === "new") {
      items.push("New cover ready");
    } else if (imageState?.cover?.kind === "none" && imageState?.canRestoreCover) {
      items.push("Cover removal pending");
    }

    const newGalleryCount = galleryItems.filter((item) => item.kind === "new").length;
    if (newGalleryCount > 0) {
      items.push(`${newGalleryCount} new gallery image${newGalleryCount === 1 ? "" : "s"}`);
    }

    if ((imageState?.removedGalleryUrls || []).length > 0) {
      const removedCount = imageState.removedGalleryUrls.length;
      items.push(`${removedCount} gallery image${removedCount === 1 ? "" : "s"} removed`);
    }

    if (imageState?.galleryOrderChanged) {
      items.push("Gallery order updated");
    }

    return items;
  }, [galleryItems, imageState]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">
        <p className="font-semibold text-foreground">
          Media stays local until you save
        </p>
        <p className="mt-1 text-muted-foreground">
          Pick, crop, remove, and reorder freely. Nothing is uploaded until you click the page&apos;s save button.
        </p>
      </div>

      {summaryItems.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {summaryItems.map((item) => (
            <span
              key={item}
              className="rounded-full border border-border bg-muted/30 px-3 py-1 text-xs font-medium text-foreground/80"
            >
              {item}
            </span>
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <section className="space-y-4 rounded-3xl border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Cover image</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Recommended size: 1200 × 630. The crop stays locked to a 16:9 frame for cards and hero sections.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || imageState?.isSaving}
              onClick={() => coverInputRef.current?.click()}
            >
              <Upload className="mr-2 h-3.5 w-3.5" />
              {coverPreviewUrl ? "Change cover" : "Choose cover"}
            </Button>
            {coverPreviewUrl ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || imageState?.isSaving || preparingCropKey === "cover"}
                onClick={() =>
                  prepareCropForItem({
                    item: {
                      id: "cover",
                      kind: imageState?.cover?.kind,
                      name: imageState?.cover?.name || "cover-image",
                      previewUrl: imageState?.cover?.previewUrl,
                      remoteUrl: imageState?.cover?.remoteUrl,
                      uploadFile: imageState?.cover?.uploadFile,
                    },
                    kind: "cover",
                  })
                }
              >
                {preparingCropKey === "cover" ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Crop className="mr-2 h-3.5 w-3.5" />
                )}
                Crop
              </Button>
            ) : null}
            {coverPreviewUrl ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={disabled || imageState?.isSaving}
                onClick={() => imageState?.removeCover()}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Remove
              </Button>
            ) : imageState?.canRestoreCover ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || imageState?.isSaving}
                onClick={() => imageState?.restoreCover()}
              >
                <RefreshCcw className="mr-2 h-3.5 w-3.5" />
                Restore
              </Button>
            ) : null}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-muted/30">
          {coverPreviewUrl ? (
            <img
              src={coverPreviewUrl}
              alt="Event cover preview"
              className="aspect-[16/9] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[16/9] w-full items-center justify-center bg-muted/20 text-muted-foreground">
              <div className="text-center">
                <ImagePlus className="mx-auto h-8 w-8" />
                <p className="mt-2 text-sm font-medium">No cover selected yet</p>
              </div>
            </div>
          )}
        </div>

        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleCoverSelection}
          disabled={disabled || imageState?.isSaving}
        />
      </section>

      <section className="space-y-4 rounded-3xl border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Images className="h-4 w-4 text-primary" />
              Gallery images
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add up to {imageState?.maxGalleryImages || 10} images. Drag cards to reorder them before save.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={
              disabled ||
              imageState?.isSaving ||
              (imageState?.remainingGallerySlots || 0) <= 0
            }
            onClick={() => galleryInputRef.current?.click()}
          >
            <ImagePlus className="mr-2 h-3.5 w-3.5" />
            Add gallery images
          </Button>
        </div>

        <div className="flex items-center justify-between rounded-2xl border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
          <span>{galleryItems.length} image{galleryItems.length === 1 ? "" : "s"} selected</span>
          <span>{imageState?.remainingGallerySlots || 0} slot{imageState?.remainingGallerySlots === 1 ? "" : "s"} left</span>
        </div>

        {galleryItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {galleryItems.map((item, index) => {
              const isPreparingCrop = preparingCropKey === item.id;

              return (
                <div
                  key={item.id}
                  draggable={!disabled}
                  onDragStart={() => setDraggedGalleryId(item.id)}
                  onDragEnd={() => setDraggedGalleryId(null)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (draggedGalleryId) {
                      imageState?.moveGalleryItemById(draggedGalleryId, item.id);
                    }
                    setDraggedGalleryId(null);
                  }}
                  className={cn(
                    "overflow-hidden rounded-2xl border bg-background transition-all",
                    draggedGalleryId === item.id && "scale-[0.98] opacity-80",
                  )}
                >
                  <div className="relative">
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="absolute left-3 top-3 flex items-center gap-2">
                      <span className="rounded-full bg-black/75 px-2 py-1 text-[10px] font-semibold text-white">
                        #{index + 1}
                      </span>
                      <span className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-foreground">
                        {item.kind === "new" ? "New" : "Saved"}
                      </span>
                    </div>
                    <div className="absolute right-3 top-3 rounded-full bg-black/70 p-1.5 text-white">
                      <GripVertical className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="space-y-3 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Drag to reorder or use the buttons below.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={disabled || imageState?.isSaving || isPreparingCrop}
                        onClick={() => prepareCropForItem({ item, kind: "gallery" })}
                      >
                        {isPreparingCrop ? (
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Crop className="mr-2 h-3.5 w-3.5" />
                        )}
                        Crop
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={disabled || imageState?.isSaving || index === 0}
                        onClick={() => imageState?.moveGalleryItem(index, index - 1)}
                      >
                        <ArrowUp className="mr-2 h-3.5 w-3.5" />
                        Up
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={
                          disabled ||
                          imageState?.isSaving ||
                          index === galleryItems.length - 1
                        }
                        onClick={() => imageState?.moveGalleryItem(index, index + 1)}
                      >
                        <ArrowDown className="mr-2 h-3.5 w-3.5" />
                        Down
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={disabled || imageState?.isSaving}
                        onClick={() => imageState?.removeGalleryItem(item.id)}
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed bg-muted/10 px-6 py-10 text-center">
            <Images className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-foreground">
              No gallery images selected yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add supporting images now and reorder them before you save the event.
            </p>
          </div>
        )}

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          multiple
          onChange={handleGallerySelection}
          disabled={disabled || imageState?.isSaving}
        />
      </section>

      <ImageCropModal
        open={Boolean(cropState)}
        sourceUrl={cropState?.sourceUrl}
        fileName={cropState?.fileName}
        mimeType={cropState?.mimeType}
        title={cropState?.title}
        description={cropState?.description}
        aspectRatio={cropState?.aspectRatio}
        outputWidth={cropState?.outputWidth}
        outputHeight={cropState?.outputHeight}
        onApply={handleCropApply}
        onClose={closeCropModal}
      />
    </div>
  );
};

export default ImagePicker;
