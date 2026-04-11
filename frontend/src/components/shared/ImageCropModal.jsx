import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Crop,
  Move,
  ScanLine,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const MIN_CROP_SIZE = 48;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const createInitialCrop = (width, height, aspectRatio) => {
  if (!width || !height) {
    return null;
  }

  if (aspectRatio) {
    const byWidth = width * 0.82;
    const byHeight = byWidth / aspectRatio;
    const byHeightLimit = height * 0.82;

    const safeWidth =
      byHeight <= byHeightLimit ? byWidth : byHeightLimit * aspectRatio;
    const safeHeight = safeWidth / aspectRatio;

    return {
      x: (width - safeWidth) / 2,
      y: (height - safeHeight) / 2,
      width: safeWidth,
      height: safeHeight,
    };
  }

  return {
    x: width * 0.1,
    y: height * 0.1,
    width: width * 0.8,
    height: height * 0.8,
  };
};

const buildOutputFileName = (fileName = "image.jpg", mimeType = "image/jpeg") => {
  const baseName = fileName.includes(".")
    ? fileName.slice(0, fileName.lastIndexOf("."))
    : fileName;
  const extension = mimeType === "image/png" ? "png" : "jpg";
  return `${baseName}-cropped.${extension}`;
};

const createCroppedFile = async ({
  sourceUrl,
  crop,
  imageMetrics,
  aspectRatio,
  outputWidth,
  outputHeight,
  fileName,
  mimeType,
}) => {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = sourceUrl;

  await image.decode();

  const scaleX = image.naturalWidth / imageMetrics.width;
  const scaleY = image.naturalHeight / imageMetrics.height;

  const sourceX = Math.max(0, Math.round(crop.x * scaleX));
  const sourceY = Math.max(0, Math.round(crop.y * scaleY));
  const sourceWidth = Math.max(1, Math.round(crop.width * scaleX));
  const sourceHeight = Math.max(1, Math.round(crop.height * scaleY));

  const canvas = document.createElement("canvas");
  const targetWidth = outputWidth || sourceWidth;
  const targetHeight =
    outputHeight || (aspectRatio ? Math.round(targetWidth / aspectRatio) : sourceHeight);

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d");

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    targetWidth,
    targetHeight,
  );

  const fileType = mimeType === "image/png" ? "image/png" : "image/jpeg";

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, fileType, 0.92);
  });

  if (!blob) {
    throw new Error("The cropped image could not be generated.");
  }

  return new File(
    [blob],
    buildOutputFileName(fileName, fileType),
    {
      type: fileType,
      lastModified: Date.now(),
    },
  );
};

const ImageCropModal = ({
  aspectRatio = null,
  description,
  fileName,
  mimeType = "image/jpeg",
  onApply,
  onClose,
  open,
  outputHeight,
  outputWidth,
  sourceUrl,
  title = "Crop image",
}) => {
  const imageRef = useRef(null);
  const interactionRef = useRef(null);
  const [imageMetrics, setImageMetrics] = useState(null);
  const [crop, setCrop] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (!open) {
      setCrop(null);
      setImageMetrics(null);
      interactionRef.current = null;
    }
  }, [open]);

  const handleImageLoad = useCallback(() => {
    const bounds = imageRef.current?.getBoundingClientRect();
    if (!bounds?.width || !bounds?.height) {
      return;
    }

    const nextMetrics = {
      width: bounds.width,
      height: bounds.height,
    };

    setImageMetrics(nextMetrics);
    setCrop(createInitialCrop(bounds.width, bounds.height, aspectRatio));
  }, [aspectRatio]);

  const handlePointerMove = useCallback((event) => {
    const interaction = interactionRef.current;
    if (!interaction || !imageMetrics) {
      return;
    }

    const deltaX = event.clientX - interaction.startX;
    const deltaY = event.clientY - interaction.startY;

    if (interaction.mode === "move") {
      const nextX = clamp(
        interaction.startCrop.x + deltaX,
        0,
        imageMetrics.width - interaction.startCrop.width,
      );
      const nextY = clamp(
        interaction.startCrop.y + deltaY,
        0,
        imageMetrics.height - interaction.startCrop.height,
      );

      setCrop((current) => ({
        ...current,
        x: nextX,
        y: nextY,
      }));
      return;
    }

    let nextWidth = clamp(
      interaction.startCrop.width + deltaX,
      MIN_CROP_SIZE,
      imageMetrics.width - interaction.startCrop.x,
    );
    let nextHeight = clamp(
      interaction.startCrop.height + deltaY,
      MIN_CROP_SIZE,
      imageMetrics.height - interaction.startCrop.y,
    );

    if (aspectRatio) {
      nextHeight = nextWidth / aspectRatio;

      if (interaction.startCrop.y + nextHeight > imageMetrics.height) {
        nextHeight = imageMetrics.height - interaction.startCrop.y;
        nextWidth = nextHeight * aspectRatio;
      }

      if (nextWidth < MIN_CROP_SIZE) {
        nextWidth = MIN_CROP_SIZE;
        nextHeight = nextWidth / aspectRatio;
      }
    }

    setCrop((current) => ({
      ...current,
      width: nextWidth,
      height: nextHeight,
    }));
  }, [aspectRatio, imageMetrics]);

  const handlePointerUp = useCallback(() => {
    interactionRef.current = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  }, [handlePointerMove]);

  const handlePointerDown = (mode) => (event) => {
    if (!crop || !imageMetrics) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    interactionRef.current = {
      mode,
      startX: event.clientX,
      startY: event.clientY,
      startCrop: crop,
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  useEffect(
    () => () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    },
    [handlePointerMove, handlePointerUp],
  );

  const canApply = Boolean(sourceUrl && crop && imageMetrics && !isApplying);
  const aspectLabel = useMemo(
    () =>
      aspectRatio
        ? `${Math.round(aspectRatio * 100) / 100}:1 locked`
        : "Free crop",
    [aspectRatio],
  );

  const handleApply = async () => {
    if (!canApply) {
      return;
    }

    setIsApplying(true);

    try {
      const croppedFile = await createCroppedFile({
        sourceUrl,
        crop,
        imageMetrics,
        aspectRatio,
        outputWidth,
        outputHeight,
        fileName,
        mimeType,
      });

      await onApply?.(croppedFile);
      onClose?.();
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose?.()}>
      <DialogContent className="max-w-4xl p-0 sm:max-w-5xl">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Crop className="h-4 w-4 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-3">
            <span>{description}</span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground/70">
              <ScanLine className="h-3.5 w-3.5" />
              {aspectLabel}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          <div className="rounded-2xl border bg-muted/20 p-4">
            <div className="relative flex max-h-[70vh] items-center justify-center overflow-hidden rounded-xl bg-black/80">
              {sourceUrl ? (
                <div className="relative inline-block">
                  <img
                    ref={imageRef}
                    src={sourceUrl}
                    alt="Crop source"
                    className="max-h-[60vh] w-auto max-w-full select-none object-contain"
                    onLoad={handleImageLoad}
                    draggable={false}
                  />

                  {crop && imageMetrics ? (
                    <div className="pointer-events-none absolute inset-0">
                      <div
                        className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
                        style={{
                          left: crop.x,
                          top: crop.y,
                          width: crop.width,
                          height: crop.height,
                        }}
                      >
                        <button
                          type="button"
                          className="pointer-events-auto absolute inset-0 cursor-move"
                          onPointerDown={handlePointerDown("move")}
                          aria-label="Move crop"
                        >
                          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[11px] font-medium text-white">
                            <Move className="h-3 w-3" />
                            Drag
                          </span>
                        </button>

                        <button
                          type="button"
                          className="pointer-events-auto absolute bottom-0 right-0 h-4 w-4 cursor-se-resize rounded-tl-md border-l border-t border-white bg-primary"
                          onPointerDown={handlePointerDown("resize")}
                          aria-label="Resize crop"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-xl border bg-muted/20 p-3 text-xs text-muted-foreground">
            Drag the crop box to reposition it, then use the bottom-right handle to resize it before applying.
          </div>
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <Button variant="outline" onClick={() => onClose?.()} disabled={isApplying}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={!canApply}>
            {isApplying ? "Applying..." : "Apply crop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropModal;
