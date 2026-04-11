import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Upload as UploadIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SIZE_CONFIGS = {
  circle: "h-28 w-28 rounded-full",
  square: "h-32 w-32 rounded-xl",
  logo: "h-28 w-28 rounded-xl",
  banner: "h-32 w-full rounded-xl",
};

const CURRENT_ITEM_SIZE_CONFIGS = {
  circle: "h-16 w-16 rounded-full",
  square: "h-20 w-20 rounded-xl",
  logo: "h-20 w-20 rounded-xl",
  banner: "h-16 w-28 rounded-xl",
};

const formatBytes = (bytes) => {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileExtension = (name = "") => {
  const lastDotIndex = name.lastIndexOf(".");
  return lastDotIndex >= 0 ? name.slice(lastDotIndex).toLowerCase() : "";
};

const parseAccept = (accept = "image/*") =>
  accept
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);

const matchesAcceptToken = (file, token) => {
  if (token === "image/*") {
    return file.type.startsWith("image/");
  }

  if (token.startsWith(".")) {
    return getFileExtension(file.name) === token;
  }

  if (token.endsWith("/*")) {
    return file.type.toLowerCase().startsWith(token.slice(0, -1));
  }

  return file.type.toLowerCase() === token;
};

const fileMatchesAccept = (file, acceptTokens) => {
  if (!acceptTokens.length) {
    return file.type.startsWith("image/");
  }

  return acceptTokens.some((token) => matchesAcceptToken(file, token));
};

const normalizeCurrentItems = (items = []) =>
  items
    .map((item, index) => {
      if (typeof item === "string") {
        return {
          key: item,
          url: item,
          alt: `Image ${index + 1}`,
          original: item,
        };
      }

      if (!item?.url) {
        return null;
      }

      return {
        key: item.id || item.key || item.url,
        url: item.url,
        alt: item.alt || `Image ${index + 1}`,
        original: item,
      };
    })
    .filter(Boolean);

const Upload = ({
  currentUrl = null,
  currentItems = [],
  onUpload,
  onRemove,
  onRemoveItem,
  isUploading = false,
  removingItemKey = null,
  accept = "image/*",
  maxSizeMB = 5,
  maxFiles = null,
  multiple = false,
  shape = "square",
  label = "Upload image",
  hint,
  className = "",
  disabled = false,
  successMessage = "Uploaded successfully!",
}) => {
  const inputRef = useRef(null);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [justUploaded, setJustUploaded] = useState(false);

  const maxBytes = maxSizeMB * 1024 * 1024;
  const acceptTokens = useMemo(() => parseAccept(accept), [accept]);
  const normalizedCurrentItems = useMemo(
    () => normalizeCurrentItems(currentItems),
    [currentItems],
  );

  const revokePreviewUrls = useCallback((items) => {
    items.forEach((item) => URL.revokeObjectURL(item.url));
  }, []);

  useEffect(() => () => revokePreviewUrls(previews), [previews, revokePreviewUrls]);

  const clearPreviews = useCallback(() => {
    revokePreviewUrls(previews);
    setPreviews([]);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [previews, revokePreviewUrls]);

  const validateFiles = useCallback(
    (files) => {
      if (maxFiles && files.length > maxFiles) {
        return `You can select up to ${maxFiles} image${maxFiles === 1 ? "" : "s"} at a time.`;
      }

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          return `"${file.name}" is not an image file.`;
        }

        if (!fileMatchesAccept(file, acceptTokens)) {
          return `"${file.name}" is not one of the supported image types.`;
        }

        if (file.size > maxBytes) {
          return `"${file.name}" exceeds the ${maxSizeMB} MB limit (${formatBytes(file.size)}).`;
        }
      }

      return null;
    },
    [acceptTokens, maxBytes, maxFiles, maxSizeMB],
  );

  const handleFiles = useCallback(
    (fileList) => {
      if (!fileList || fileList.length === 0) {
        return;
      }

      const nextFiles = Array.from(fileList);
      const selectedFiles = multiple ? nextFiles : nextFiles.slice(0, 1);
      const nextError = validateFiles(selectedFiles);

      if (nextError) {
        setError(nextError);
        return;
      }

      setError(null);
      setJustUploaded(false);
      clearPreviews();

      setPreviews(
        selectedFiles.map((file) => ({
          file,
          url: URL.createObjectURL(file),
        })),
      );
    },
    [clearPreviews, multiple, validateFiles],
  );

  const openFileDialog = useCallback(() => {
    if (!disabled && !isUploading) {
      inputRef.current?.click();
    }
  }, [disabled, isUploading]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragging(false);

      if (disabled || isUploading) {
        return;
      }

      handleFiles(event.dataTransfer.files);
    },
    [disabled, handleFiles, isUploading],
  );

  const handleUpload = useCallback(async () => {
    if (!onUpload || previews.length === 0) {
      return;
    }

    setError(null);

    try {
      if (multiple) {
        await onUpload(previews.map((preview) => preview.file));
      } else {
        await onUpload(previews[0].file);
      }

      setJustUploaded(true);
      clearPreviews();
    } catch (uploadError) {
      setError(uploadError?.message || "Upload failed. Please try again.");
    }
  }, [clearPreviews, multiple, onUpload, previews]);

  const handleRemove = useCallback(async () => {
    if (!onRemove) {
      return;
    }

    setError(null);
    setJustUploaded(false);

    try {
      await onRemove();
    } catch (removeError) {
      setError(removeError?.message || "Remove failed. Please try again.");
    }
  }, [onRemove]);

  const handleRemovePreview = useCallback((previewUrl) => {
    setPreviews((current) => {
      const target = current.find((preview) => preview.url === previewUrl);

      if (target) {
        URL.revokeObjectURL(target.url);
      }

      const nextPreviews = current.filter((preview) => preview.url !== previewUrl);

      if (!nextPreviews.length && inputRef.current) {
        inputRef.current.value = "";
      }

      return nextPreviews;
    });
  }, []);

  const hasPreviews = previews.length > 0;
  const hasCurrentSingle = Boolean(currentUrl) && !hasPreviews;
  const hasCurrentItems = normalizedCurrentItems.length > 0;
  const isDisabled = disabled || isUploading;
  const sizeClass = SIZE_CONFIGS[shape] || SIZE_CONFIGS.square;
  const currentItemSizeClass =
    CURRENT_ITEM_SIZE_CONFIGS[shape] || CURRENT_ITEM_SIZE_CONFIGS.square;
  const showImageStage = !multiple && (hasCurrentSingle || hasPreviews);

  return (
    <div className={cn("space-y-3", className)}>
      {hasCurrentItems ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Current Images
          </p>
          <div className="flex flex-wrap gap-3">
            {normalizedCurrentItems.map((item) => {
              const isRemovingItem = removingItemKey === item.key;

              return (
                <div
                  key={item.key}
                  className={cn(
                    "group relative overflow-hidden border border-border bg-card",
                    currentItemSizeClass,
                  )}
                >
                  <img
                    src={item.url}
                    alt={item.alt}
                    className="h-full w-full object-cover"
                  />

                  {onRemoveItem ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isRemovingItem || isDisabled}
                        onClick={() => onRemoveItem(item.original)}
                      >
                        {isRemovingItem ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <X className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200",
          isDragging
            ? "scale-[1.01] border-primary bg-primary/5"
            : showImageStage
              ? "border-border bg-card"
              : "border-border/60 bg-card/60 hover:border-primary/50 hover:bg-primary/5",
          isDisabled && "cursor-not-allowed opacity-60",
        )}
        onClick={openFileDialog}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {showImageStage ? (
          <div
            className={cn(
              "relative overflow-hidden",
              shape === "banner" ? "h-32 w-full rounded-xl" : `${sizeClass} mx-auto my-4`,
            )}
            onClick={(event) => event.stopPropagation()}
          >
            {hasPreviews ? (
              <img
                src={previews[0].url}
                alt="Selected preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src={currentUrl}
                alt="Current upload"
                className="h-full w-full object-cover"
              />
            )}

            {hasPreviews ? (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-black">
                NEW
              </span>
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 transition-opacity hover:opacity-100"
                onClick={openFileDialog}
              >
                <Camera className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex select-none flex-col items-center justify-center gap-2 px-4 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <ImagePlus className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              {isDragging ? "Drop to upload" : label}
            </p>
            <p className="text-xs text-muted-foreground">
              Drag and drop or click to browse. Max {maxSizeMB} MB
              {maxFiles ? ` · Up to ${maxFiles}` : ""}
            </p>
          </div>
        )}
      </div>

      {hasPreviews && multiple ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Selected Files
          </p>
          <div className="flex flex-wrap gap-2">
            {previews.map((preview) => (
              <div
                key={preview.url}
                className="relative h-16 w-16 overflow-hidden rounded-lg border border-border"
              >
                <img
                  src={preview.url}
                  alt={preview.file.name}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-white hover:brightness-110"
                  onClick={() => handleRemovePreview(preview.url)}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {justUploaded && !error ? (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      ) : null}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isDisabled}
          onClick={openFileDialog}
          className="flex-1 border-border"
        >
          <UploadIcon className="mr-1.5 h-3.5 w-3.5" />
          {hasPreviews ? "Change" : "Choose file"}
        </Button>

        {hasPreviews ? (
          <Button
            type="button"
            size="sm"
            disabled={isDisabled}
            onClick={handleUpload}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Camera className="mr-1.5 h-3.5 w-3.5" />
                {multiple
                  ? `Upload ${previews.length} image${previews.length === 1 ? "" : "s"}`
                  : "Save image"}
              </>
            )}
          </Button>
        ) : null}

        {!hasPreviews && currentUrl && onRemove ? (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isDisabled}
            onClick={handleRemove}
            className="flex items-center gap-1.5"
          >
            {isUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
            Remove
          </Button>
        ) : null}

        {hasPreviews ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isUploading}
            onClick={clearPreviews}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        ) : null}
      </div>

      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
        disabled={isDisabled}
      />
    </div>
  );
};

export default Upload;
