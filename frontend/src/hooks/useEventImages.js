import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  removeCoverImage,
  removeGalleryImages,
  reorderGalleryImages,
  uploadCoverImage,
  uploadGalleryImages,
} from "@/api/events.api";
import { broadcastBrowseRefresh } from "@/lib/browseSync";

const MAX_GALLERY_IMAGES = 10;

const createLocalId = () =>
  `event-image-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const isLocalPreview = (value) =>
  typeof value === "string" && value.startsWith("blob:");

const revokePreviewUrl = (value) => {
  if (isLocalPreview(value)) {
    URL.revokeObjectURL(value);
  }
};

const buildCoverState = (coverUrl) =>
  coverUrl
    ? {
        id: "cover-existing",
        kind: "existing",
        previewUrl: coverUrl,
        remoteUrl: coverUrl,
        name: "Cover image",
        uploadFile: null,
      }
    : {
        id: "cover-empty",
        kind: "none",
        previewUrl: null,
        remoteUrl: null,
        name: "",
        uploadFile: null,
      };

const buildExistingGalleryItems = (galleryUrls = []) =>
  galleryUrls
    .filter(Boolean)
    .map((url, index) => ({
      id: `gallery-existing-${index}-${url}`,
      kind: "existing",
      previewUrl: url,
      remoteUrl: url,
      name: `Gallery image ${index + 1}`,
      uploadFile: null,
    }));

const buildFileImageItem = (file, itemId = createLocalId()) => ({
  id: itemId,
  kind: "new",
  previewUrl: URL.createObjectURL(file),
  remoteUrl: null,
  name: file?.name || "image.jpg",
  uploadFile: file,
});

const arraysEqual = (left = [], right = []) =>
  left.length === right.length &&
  left.every((value, index) => value === right[index]);

const getGallerySignature = (items = []) =>
  items.map((item) =>
    item.kind === "existing"
      ? `existing:${item.remoteUrl}`
      : `new:${item.id}`,
  );

const moveItem = (items, fromIndex, toIndex) => {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

export const useEventImages = ({
  initialCoverUrl = "",
  initialGalleryUrls = [],
  maxGalleryImages = MAX_GALLERY_IMAGES,
} = {}) => {
  const initialStateRef = useRef({
    coverUrl: initialCoverUrl || "",
    galleryUrls: initialGalleryUrls.filter(Boolean),
  });

  const [cover, setCover] = useState(() => buildCoverState(initialCoverUrl));
  const [galleryItems, setGalleryItems] = useState(() =>
    buildExistingGalleryItems(initialGalleryUrls),
  );
  const [removedGalleryUrls, setRemovedGalleryUrls] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const coverRef = useRef(cover);
  const galleryItemsRef = useRef(galleryItems);

  useEffect(() => {
    coverRef.current = cover;
  }, [cover]);

  useEffect(() => {
    galleryItemsRef.current = galleryItems;
  }, [galleryItems]);

  const revokeCurrentLocalPreviews = useCallback(() => {
    revokePreviewUrl(
      coverRef.current?.kind === "new" ? coverRef.current.previewUrl : null,
    );
    galleryItemsRef.current.forEach((item) => {
      if (item.kind === "new") {
        revokePreviewUrl(item.previewUrl);
      }
    });
  }, []);

  const resetFromEvent = useCallback((event = {}) => {
    revokeCurrentLocalPreviews();

    const nextCoverUrl = event?.coverImage || "";
    const nextGalleryUrls = Array.isArray(event?.images)
      ? event.images.filter(Boolean)
      : [];

    initialStateRef.current = {
      coverUrl: nextCoverUrl,
      galleryUrls: nextGalleryUrls,
    };

    setCover(buildCoverState(nextCoverUrl));
    setGalleryItems(buildExistingGalleryItems(nextGalleryUrls));
    setRemovedGalleryUrls([]);
  }, [revokeCurrentLocalPreviews]);

  useEffect(() => {
    const normalizedGallery = initialGalleryUrls.filter(Boolean);
    const hasCoverChanged =
      initialStateRef.current.coverUrl !== (initialCoverUrl || "");
    const hasGalleryChanged = !arraysEqual(
      initialStateRef.current.galleryUrls,
      normalizedGallery,
    );

    if (hasCoverChanged || hasGalleryChanged) {
      resetFromEvent({
        coverImage: initialCoverUrl,
        images: normalizedGallery,
      });
    }
  }, [initialCoverUrl, initialGalleryUrls, resetFromEvent]);

  useEffect(
    () => () => {
      revokeCurrentLocalPreviews();
    },
    [revokeCurrentLocalPreviews],
  );

  const removeCover = useCallback(() => {
    setCover((current) => {
      if (current.kind === "new") {
        revokePreviewUrl(current.previewUrl);
      }

      return buildCoverState("");
    });
  }, []);

  const restoreCover = useCallback(() => {
    if (!initialStateRef.current.coverUrl) {
      return;
    }

    setCover((current) => {
      if (current.kind === "new") {
        revokePreviewUrl(current.previewUrl);
      }

      return buildCoverState(initialStateRef.current.coverUrl);
    });
  }, []);

  const replaceCoverFile = useCallback((file) => {
    setCover((current) => {
      if (current.kind === "new") {
        revokePreviewUrl(current.previewUrl);
      }

      return buildFileImageItem(file, "cover-pending");
    });
  }, []);

  const addGalleryFiles = useCallback((files) => {
    const nextFiles = Array.isArray(files) ? files.filter(Boolean) : [];

    if (!nextFiles.length) {
      return;
    }

    const remaining = Math.max(0, maxGalleryImages - galleryItemsRef.current.length);

    if (nextFiles.length > remaining) {
      throw new Error(
        remaining > 0
          ? `You can add ${remaining} more gallery image${remaining === 1 ? "" : "s"}.`
          : "You already have the maximum number of gallery images.",
      );
    }

    setGalleryItems((current) => [
      ...current,
      ...nextFiles.map((file) => buildFileImageItem(file)),
    ]);
  }, [maxGalleryImages]);

  const replaceGalleryItemFile = useCallback((itemId, file) => {
    setGalleryItems((current) => {
      const target = current.find((item) => item.id === itemId);
      if (!target) {
        return current;
      }

      if (target.kind === "existing" && target.remoteUrl) {
        setRemovedGalleryUrls((existingRemoved) =>
          existingRemoved.includes(target.remoteUrl)
            ? existingRemoved
            : [...existingRemoved, target.remoteUrl],
        );
      }

      if (target.kind === "new") {
        revokePreviewUrl(target.previewUrl);
      }

      return current.map((item) =>
        item.id === itemId ? buildFileImageItem(file, itemId) : item,
      );
    });
  }, []);

  const removeGalleryItem = useCallback((itemId) => {
    setGalleryItems((current) => {
      const target = current.find((item) => item.id === itemId);
      if (!target) {
        return current;
      }

      if (target.kind === "existing" && target.remoteUrl) {
        setRemovedGalleryUrls((existingRemoved) =>
          existingRemoved.includes(target.remoteUrl)
            ? existingRemoved
            : [...existingRemoved, target.remoteUrl],
        );
      }

      if (target.kind === "new") {
        revokePreviewUrl(target.previewUrl);
      }

      return current.filter((item) => item.id !== itemId);
    });
  }, []);

  const moveGalleryItem = useCallback((fromIndex, toIndex) => {
    setGalleryItems((current) => moveItem(current, fromIndex, toIndex));
  }, []);

  const moveGalleryItemById = useCallback((activeId, overId) => {
    if (!activeId || !overId || activeId === overId) {
      return;
    }

    setGalleryItems((current) => {
      const fromIndex = current.findIndex((item) => item.id === activeId);
      const toIndex = current.findIndex((item) => item.id === overId);
      return moveItem(current, fromIndex, toIndex);
    });
  }, []);

  const gallerySignature = useMemo(
    () => getGallerySignature(galleryItems),
    [galleryItems],
  );

  const galleryOrderChanged = !arraysEqual(
    gallerySignature,
    getGallerySignature(buildExistingGalleryItems(initialStateRef.current.galleryUrls)),
  );

  const hasGalleryChanges =
    removedGalleryUrls.length > 0 ||
    galleryItems.some((item) => item.kind === "new") ||
    galleryOrderChanged;

  const hasCoverChanges = useMemo(() => {
    const initialCoverUrlValue = initialStateRef.current.coverUrl;

    if (!initialCoverUrlValue) {
      return cover.kind === "new";
    }

    if (cover.kind === "none") {
      return true;
    }

    if (cover.kind === "new") {
      return true;
    }

    return cover.remoteUrl !== initialCoverUrlValue;
  }, [cover]);

  const canRestoreCover =
    Boolean(initialStateRef.current.coverUrl) && cover.kind === "none";

  const hasChanges = hasCoverChanges || hasGalleryChanges;

  const remainingGallerySlots = Math.max(0, maxGalleryImages - galleryItems.length);

  const saveImages = useCallback(async (eventSlug) => {
    if (!eventSlug || !hasChanges) {
      return null;
    }

    setIsSaving(true);

    try {
      const initialCoverUrlValue = initialStateRef.current.coverUrl;
      let latestEvent = null;

      if (cover.kind === "none" && initialCoverUrlValue) {
        latestEvent = await removeCoverImage(eventSlug);
      }

      if (cover.kind === "new" && cover.uploadFile) {
        latestEvent = await uploadCoverImage(eventSlug, cover.uploadFile);
      }

      if (removedGalleryUrls.length > 0) {
        latestEvent = await removeGalleryImages(eventSlug, removedGalleryUrls);
      }

      const newGalleryItems = galleryItems.filter((item) => item.kind === "new");
      const uploadedUrlById = new Map();

      if (newGalleryItems.length > 0) {
        latestEvent = await uploadGalleryImages(
          eventSlug,
          newGalleryItems.map((item) => item.uploadFile),
        );

        const currentServerImages = Array.isArray(latestEvent?.images)
          ? latestEvent.images.filter(Boolean)
          : [];
        const existingUrlSet = new Set(
          galleryItems
            .filter((item) => item.kind === "existing")
            .map((item) => item.remoteUrl)
            .filter(Boolean),
        );
        const uploadedUrls = currentServerImages.filter(
          (url) => !existingUrlSet.has(url),
        );

        newGalleryItems.forEach((item, index) => {
          if (uploadedUrls[index]) {
            uploadedUrlById.set(item.id, uploadedUrls[index]);
          }
        });

        if (uploadedUrlById.size !== newGalleryItems.length) {
          throw new Error(
            "Some gallery uploads did not finish correctly. Please try saving again.",
          );
        }
      }

      const desiredGalleryOrder = galleryItems
        .map((item) => {
          if (item.kind === "existing") {
            return item.remoteUrl;
          }

          return uploadedUrlById.get(item.id);
        })
        .filter(Boolean);

      const currentGalleryOrder = Array.isArray(latestEvent?.images)
        ? latestEvent.images.filter(Boolean)
        : initialStateRef.current.galleryUrls.filter(
            (url) => !removedGalleryUrls.includes(url),
          );

      if (!arraysEqual(currentGalleryOrder, desiredGalleryOrder)) {
        latestEvent = await reorderGalleryImages(eventSlug, desiredGalleryOrder);
      }

      if (latestEvent) {
        resetFromEvent(latestEvent);
        broadcastBrowseRefresh({
          slug: latestEvent.slug || eventSlug,
          reason: "event-images-updated",
        });
      }

      return latestEvent;
    } finally {
      setIsSaving(false);
    }
  }, [
    cover,
    galleryItems,
    galleryOrderChanged,
    hasChanges,
    removedGalleryUrls,
    resetFromEvent,
  ]);

  return {
    canRestoreCover,
    cover,
    galleryOrderChanged,
    galleryItems,
    hasChanges,
    hasCoverChanges,
    hasGalleryChanges,
    isSaving,
    maxGalleryImages,
    remainingGallerySlots,
    removedGalleryUrls,
    addGalleryFiles,
    moveGalleryItem,
    moveGalleryItemById,
    removeCover,
    removeGalleryItem,
    replaceCoverFile,
    replaceGalleryItemFile,
    resetFromEvent,
    restoreCover,
    saveImages,
  };
};

export default useEventImages;
