import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Camera, Heart, ImagePlus, MapPin, Sparkles } from "lucide-react";
import { getApiErrorMessage } from "@/api/client";
import {
  getCapturedMoments,
  toggleCapturedMomentReaction,
  uploadCapturedMoments,
} from "@/api/captured-moments.api";
import { toggleEventImageReaction } from "@/api/events.api";
import { toast } from "@/components/shared/common";
import { useAuthContext } from "@/context/AuthContext";
import Container from "@/components/layout/Container";
import ImageUpload from "@/components/shared/ImageUpload";
import { useBrowse } from "@/hooks";
import { broadcastBrowseRefresh, subscribeToBrowseRefresh } from "@/lib/browseSync";
import { cn } from "@/lib/utils";

const MAX_BATCH_UPLOADS = 3;
const CAPTURED_MOMENT_LIMIT = 18;

const formatMomentDate = (value) => {
  if (!value) {
    return "Date TBA";
  }

  try {
    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Date TBA";
  }
};

const getCategoryLabel = (event, fallback = "Events") =>
  event?.category?.label || event?.category?.name || fallback;

const buildReactionKey = ({ eventSlug, image, capturedMomentId }) => {
  if (capturedMomentId) {
    return `captured:${capturedMomentId}`;
  }

  return `event:${eventSlug}:${image}`;
};

const normalizeReactionState = (value = {}) => ({
  count: Math.max(0, Number(value?.count || 0)),
  hasReacted: Boolean(value?.hasReacted),
});

const getPhotoReactionState = (photo, overrides = {}) =>
  normalizeReactionState(
    overrides[photo?.reactionKey] || {
      count: photo?.reactionCount,
      hasReacted: photo?.hasReacted,
    },
  );

const getNextReactionState = (value = {}) => {
  const current = normalizeReactionState(value);

  return {
    count: current.hasReacted
      ? Math.max(0, current.count - 1)
      : current.count + 1,
    hasReacted: !current.hasReacted,
  };
};

const pruneReactionMapEntry = (state, key) => {
  if (!key || !Object.prototype.hasOwnProperty.call(state, key)) {
    return state;
  }

  const nextState = { ...state };
  delete nextState[key];
  return nextState;
};

const uniqueById = (items = []) => {
  const seen = new Set();

  return items.filter((item) => {
    const key = item?.id || item?._id;

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const EventPhotos = () => {
  const { getEvents, buildEventUrl, locationLabel, categoryItems } = useBrowse();
  const { isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeFilter, setActiveFilter] = useState("all");
  const [uploadCategory, setUploadCategory] = useState("");
  const [capturedMoments, setCapturedMoments] = useState([]);
  const [isLoadingCapturedMoments, setIsLoadingCapturedMoments] = useState(true);
  const [reactionOverrides, setReactionOverrides] = useState({});
  const [pendingReactionKeys, setPendingReactionKeys] = useState({});

  const reactionOverridesRef = useRef({});

  useEffect(() => {
    reactionOverridesRef.current = reactionOverrides;
  }, [reactionOverrides]);

  useEffect(() => {
    if (!isAuthenticated) {
      setReactionOverrides({});
      setPendingReactionKeys({});
    }
  }, [isAuthenticated]);

  const openLoginModal = useCallback(() => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("auth", "login");

    navigate(
      {
        pathname: location.pathname,
        search: `?${searchParams.toString()}`,
        hash: location.hash,
      },
      {
        state: {
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
          },
        },
      },
    );
  }, [location.hash, location.pathname, location.search, navigate]);

  const loadCapturedMoments = useCallback(async ({ silent = false, signal } = {}) => {
    if (!silent) {
      setIsLoadingCapturedMoments(true);
    }

    try {
      const result = await getCapturedMoments(
        {
          page: 1,
          limit: CAPTURED_MOMENT_LIMIT,
        },
        { signal },
      );

      if (signal?.aborted) {
        return;
      }

      setCapturedMoments(result?.moments || []);
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      if (!silent) {
        toast.error(
          getApiErrorMessage(error, "Failed to load captured moments"),
        );
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoadingCapturedMoments(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void loadCapturedMoments({ signal: controller.signal });

    return () => controller.abort();
  }, [loadCapturedMoments]);

  useEffect(() => {
    const unsubscribe = subscribeToBrowseRefresh((detail) => {
      if (!String(detail?.reason || "").startsWith("captured-moment")) {
        return;
      }

      void loadCapturedMoments({ silent: true });
    });

    return unsubscribe;
  }, [loadCapturedMoments]);

  const browseEvents = getEvents();

  const eventPhotos = useMemo(() => {
    const rankedEvents = [...browseEvents]
      .filter((event) => Array.isArray(event.images) && event.images.length > 0)
      .sort((left, right) => {
        const leftScore =
          Number(left.isFeatured || 0) * 100 +
          Number(left.averageRating || 0) * 10 +
          Number(left.reviewCount || 0) +
          Number(left.totalSold || 0) / 100;
        const rightScore =
          Number(right.isFeatured || 0) * 100 +
          Number(right.averageRating || 0) * 10 +
          Number(right.reviewCount || 0) +
          Number(right.totalSold || 0) / 100;

        return rightScore - leftScore;
      });

    const seenImages = new Set();
    const moments = [];

    rankedEvents.forEach((event) => {
      const images = Array.isArray(event.images) ? event.images.filter(Boolean) : [];

      images.slice(0, 2).forEach((image, index) => {
        if (!image || seenImages.has(image) || moments.length >= 12) {
          return;
        }

        seenImages.add(image);

        const baseReaction = normalizeReactionState(
          event.imageReactionSummary?.[image],
        );

        moments.push({
          id: `${event.id || event._id || event.slug}-${index}-${image}`,
          kind: "event",
          title: event.title || "Live Event",
          image,
          categorySlug: event.category?.slug || "events",
          categoryName: getCategoryLabel(event),
          categoryId: event.category?.id || event.category?._id || null,
          eventSlug: event.slug || null,
          eventHref: event.slug ? buildEventUrl(event) : null,
          eventLocation:
            event.location?.city || event.location?.name || locationLabel,
          eventDate: formatMomentDate(event.startDate),
          reactionKey: buildReactionKey({
            eventSlug: event.slug || event.id || event._id,
            image,
          }),
          reactionCount: baseReaction.count,
          hasReacted: baseReaction.hasReacted,
          badge: event.isFeatured ? "Featured Event" : "Live Gallery",
        });
      });
    });

    return moments;
  }, [browseEvents, buildEventUrl, locationLabel]);

  const capturedMomentPhotos = useMemo(
    () =>
      capturedMoments.map((moment) => ({
        id: moment.id || moment._id,
        kind: "captured-moment",
        capturedMomentId: moment.id || moment._id,
        title: moment.title || "Captured Moment",
        image: moment.image,
        categorySlug: moment.category?.slug || "community",
        categoryName: moment.category?.name || "Community",
        categoryId: moment.category?.id || moment.category?._id || null,
        eventSlug: null,
        eventHref: null,
        eventLocation: moment.uploader?.name
          ? `Shared by ${moment.uploader.name}`
          : "Shared by the community",
        eventDate: formatMomentDate(moment.createdAt),
        reactionKey: buildReactionKey({
          capturedMomentId: moment.id || moment._id,
        }),
        reactionCount: Number(moment.reactionCount || 0),
        hasReacted: Boolean(moment.hasReacted),
        badge: "Community Upload",
      })),
    [capturedMoments],
  );

  const uploadCategories = useMemo(() => {
    const categoryMap = new Map();

    categoryItems.forEach((category) => {
      if (!category?.slug) {
        return;
      }

      categoryMap.set(category.slug, {
        id: category.slug,
        label: category.label || category.name || category.slug,
        categoryId: category.id || category._id || null,
      });
    });

    [...eventPhotos, ...capturedMomentPhotos].forEach((moment) => {
      if (!moment.categorySlug) {
        return;
      }

      if (!categoryMap.has(moment.categorySlug)) {
        categoryMap.set(moment.categorySlug, {
          id: moment.categorySlug,
          label: moment.categoryName,
          categoryId: moment.categoryId || null,
        });
      }
    });

    const categories = Array.from(categoryMap.values());

    return categories.length
      ? categories
      : [{ id: "community", label: "Community", categoryId: null }];
  }, [capturedMomentPhotos, categoryItems, eventPhotos]);

  const filterCategories = useMemo(() => {
    const counts = new Map();

    [...capturedMomentPhotos, ...eventPhotos].forEach((moment) => {
      if (!moment.categorySlug) {
        return;
      }

      const current = counts.get(moment.categorySlug) || {
        id: moment.categorySlug,
        label: moment.categoryName,
        count: 0,
      };
      current.count += 1;
      counts.set(moment.categorySlug, current);
    });

    return Array.from(counts.values()).sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return left.label.localeCompare(right.label);
    });
  }, [capturedMomentPhotos, eventPhotos]);

  const resolvedActiveFilter =
    activeFilter === "all" ||
    filterCategories.some((category) => category.id === activeFilter)
      ? activeFilter
      : "all";

  const resolvedUploadCategory =
    resolvedActiveFilter !== "all" &&
    uploadCategories.some((category) => category.id === resolvedActiveFilter)
      ? resolvedActiveFilter
      : uploadCategories.some((category) => category.id === uploadCategory)
        ? uploadCategory
        : uploadCategories[0]?.id || "community";

  const displayedPhotos = useMemo(() => {
    const allMoments = [...capturedMomentPhotos, ...eventPhotos];

    if (resolvedActiveFilter === "all") {
      return allMoments;
    }

    return allMoments.filter(
      (moment) => moment.categorySlug === resolvedActiveFilter,
    );
  }, [capturedMomentPhotos, eventPhotos, resolvedActiveFilter]);

  const uploadCategoryMeta = useMemo(
    () =>
      uploadCategories.find((category) => category.id === resolvedUploadCategory) ||
      uploadCategories[0] || {
        id: "community",
        label: "Community",
        categoryId: null,
      },
    [resolvedUploadCategory, uploadCategories],
  );

  const handleUpload = useCallback(
    async (files) => {
      const selectedFiles = (Array.isArray(files) ? files : [files]).filter(Boolean);

      if (!selectedFiles.length) {
        return;
      }

      if (!isAuthenticated) {
        openLoginModal();
        throw new Error("Please log in to share a public photo.");
      }

      try {
        const uploadedMoments = await uploadCapturedMoments(selectedFiles, {
          categoryId: uploadCategoryMeta.categoryId || undefined,
        });

        setCapturedMoments((current) =>
          uniqueById([...(uploadedMoments || []), ...current]),
        );

        broadcastBrowseRefresh({
          reason: "captured-moment-created",
        });
      } catch (error) {
        throw new Error(
          getApiErrorMessage(error, "Failed to upload your photo"),
        );
      }
    },
    [isAuthenticated, openLoginModal, uploadCategoryMeta.categoryId],
  );

  const handleReaction = useCallback(
    async (photo) => {
      const reactionKey = photo?.reactionKey;

      if (!reactionKey) {
        return;
      }

      if (!isAuthenticated) {
        openLoginModal();
        return;
      }

      const currentReaction = getPhotoReactionState(
        photo,
        reactionOverridesRef.current,
      );
      const optimisticReaction = getNextReactionState(currentReaction);

      const hadPreviousOverride = Object.prototype.hasOwnProperty.call(
        reactionOverridesRef.current,
        reactionKey,
      );
      const previousOverride = reactionOverridesRef.current[reactionKey];

      setReactionOverrides((current) => ({
        ...current,
        [reactionKey]: optimisticReaction,
      }));
      setPendingReactionKeys((current) => ({
        ...current,
        [reactionKey]: true,
      }));

      try {
        if (photo.kind === "captured-moment") {
          const result = await toggleCapturedMomentReaction(photo.capturedMomentId);

          setCapturedMoments((current) =>
            current.map((moment) =>
              String(moment.id || moment._id) === String(photo.capturedMomentId)
                ? result?.moment || moment
                : moment,
            ),
          );
          setReactionOverrides((current) =>
            pruneReactionMapEntry(current, reactionKey),
          );

          broadcastBrowseRefresh({
            reason: "captured-moment-reaction-updated",
            momentId: photo.capturedMomentId,
          });
          return;
        }

        if (!photo.eventSlug) {
          throw new Error("This photo is not linked to a published event yet.");
        }

        const result = await toggleEventImageReaction(photo.eventSlug, photo.image);
        const confirmedReaction = normalizeReactionState(result?.reaction);

        setReactionOverrides((current) => ({
          ...current,
          [reactionKey]: confirmedReaction,
        }));

        broadcastBrowseRefresh({
          slug: photo.eventSlug,
          imageUrl: photo.image,
          reason: "image-reaction-updated",
        });
      } catch (error) {
        setReactionOverrides((current) => {
          if (hadPreviousOverride) {
            return {
              ...current,
              [reactionKey]: previousOverride,
            };
          }

          return pruneReactionMapEntry(current, reactionKey);
        });
        toast.error(
          getApiErrorMessage(error, "Failed to update photo reaction"),
        );
      } finally {
        setPendingReactionKeys((current) =>
          pruneReactionMapEntry(current, reactionKey),
        );
      }
    },
    [isAuthenticated, openLoginModal],
  );

  return (
    <section className="bg-background py-16 transition-colors duration-300">
      <Container>
        <div className="mb-10 flex flex-col gap-4 border-l-4 border-lime-500 pl-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-black uppercase leading-none tracking-tighter text-foreground md:text-4xl">
              Captured <span className="text-lime-500">Moments</span>
            </h2>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Live gallery from {locationLabel}
            </p>
          </div>
          <Link
            to="/browse"
            className="flex items-center gap-2 pb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground transition-colors hover:text-lime-500"
          >
            Browse More Events <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.5fr)_23rem]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto scrollbar-hide">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={cn(
                  "rounded-full border px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                  resolvedActiveFilter === "all"
                    ? "border-lime-500 bg-lime-500 text-black"
                    : "border-border bg-card text-muted-foreground hover:border-lime-500/50",
                )}
              >
                All Photos ({capturedMomentPhotos.length + eventPhotos.length})
              </button>

              {filterCategories.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={cn(
                    "rounded-full border px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                    resolvedActiveFilter === filter.id
                      ? "border-lime-500 bg-lime-500 text-black"
                      : "border-border bg-card text-muted-foreground hover:border-lime-500/50",
                  )}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            {displayedPhotos.length ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                {displayedPhotos.map((photo) => {
                  const reactionState = getPhotoReactionState(
                    photo,
                    reactionOverrides,
                  );
                  const isPendingReaction = Boolean(
                    pendingReactionKeys[photo.reactionKey],
                  );
                  const reactionLabel = `${reactionState.count} ${
                    reactionState.count === 1 ? "react" : "reacts"
                  }`;

                  return (
                    <article
                      key={photo.id}
                      className="group relative aspect-square overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-lime-500/30"
                    >
                      <img
                        src={photo.image}
                        alt={photo.title}
                        className="h-full w-full object-cover transition-all duration-700 group-hover:scale-[1.04]"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/15 to-transparent p-5">
                        <div className="flex h-full flex-col justify-between">
                          <div className="flex items-start justify-between gap-3">
                            <span className="rounded-full border border-white/20 bg-black/45 px-3 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-white backdrop-blur-sm">
                              {photo.badge}
                            </span>

                            <button
                              type="button"
                              aria-pressed={reactionState.hasReacted}
                              aria-label={`${
                                reactionState.hasReacted ? "Remove reaction from" : "React to"
                              } ${photo.title}`}
                              onClick={() => void handleReaction(photo)}
                              disabled={isPendingReaction}
                              title={reactionLabel}
                              className={cn(
                                "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] backdrop-blur-sm transition-all",
                                reactionState.hasReacted
                                  ? "border-rose-400/60 bg-rose-500/20 text-white"
                                  : "border-white/15 bg-black/45 text-white/85 hover:border-lime-400/40 hover:text-white",
                                isPendingReaction && "cursor-wait opacity-70",
                              )}
                            >
                              <Heart
                                size={12}
                                className={cn(
                                  "transition-transform",
                                  reactionState.hasReacted
                                    ? "fill-rose-500 text-rose-500"
                                    : "text-lime-400",
                                )}
                              />
                              <span>{reactionState.count}</span>
                            </button>
                          </div>

                          <div>
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-3 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-lime-400 backdrop-blur-sm">
                                <Sparkles size={10} />
                                {photo.categoryName}
                              </span>

                              {photo.kind === "captured-moment" ? (
                                <span className="rounded-full bg-lime-500 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-black">
                                  Public
                                </span>
                              ) : null}
                            </div>

                            <h3 className="mb-2 text-xl font-black uppercase leading-tight text-foreground">
                              {photo.title}
                            </h3>

                            <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/75">
                              <span className="inline-flex items-center gap-1">
                                <MapPin size={11} className="text-lime-400" />
                                {photo.eventLocation}
                              </span>
                              <span>{photo.eventDate}</span>
                            </div>

                            <div className="flex items-end justify-between gap-3">
                              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/85">
                                {reactionLabel} visible on this shot
                              </p>

                              {photo.eventHref ? (
                                <Link
                                  to={photo.eventHref}
                                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white transition-colors hover:border-lime-500/50 hover:text-lime-400"
                                >
                                  View Event <ArrowRight size={12} />
                                </Link>
                              ) : (
                                <span className="inline-flex items-center rounded-full border border-white/10 bg-black/30 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/60">
                                  Public Post
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-border bg-card/50 px-6 py-14 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-500/10">
                  <Camera className="h-6 w-6 text-lime-500" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-wide text-foreground">
                  No moments in this filter yet
                </h3>
                <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                  Switch back to all photos or upload a new public moment from
                  the panel on the right to kick this gallery back into motion.
                </p>
                {resolvedActiveFilter !== "all" ? (
                  <button
                    type="button"
                    onClick={() => setActiveFilter("all")}
                    className="mt-5 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground transition-colors hover:border-lime-500/40 hover:text-lime-500"
                  >
                    Show All Moments
                  </button>
                ) : null}
              </div>
            )}
          </div>

          <aside className="h-fit rounded-[2rem] border border-lime-500/20 bg-card p-5 shadow-sm xl:sticky xl:top-24">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lime-500/10">
                <ImagePlus className="h-5 w-5 text-lime-500" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
                  Share A Moment
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Upload a photo to the public gallery and it will stay visible
                  after refresh for everyone who visits this page.
                </p>
              </div>
            </div>

            <div className="mb-4 rounded-2xl border border-border/70 bg-background/60 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                Tag This Upload
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {uploadCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setUploadCategory(category.id)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                      resolvedUploadCategory === category.id
                        ? "border-lime-500 bg-lime-500 text-black"
                        : "border-border bg-card text-muted-foreground hover:border-lime-500/40 hover:text-foreground",
                    )}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            <ImageUpload
              currentItems={[]}
              onUpload={handleUpload}
              accept="image/jpeg,image/png,image/webp"
              multiple={true}
              maxFiles={MAX_BATCH_UPLOADS}
              maxSizeMB={4}
              shape="square"
              label={`Share to ${uploadCategoryMeta.label}`}
              hint="JPEG, PNG, or WebP - Saved publicly - Visible after refresh"
              successMessage="Photo shared to the public gallery."
            />

            <div className="mt-5 rounded-2xl border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">
                Public uploads loaded: {capturedMomentPhotos.length}
                {isLoadingCapturedMoments ? " (refreshing...)" : ""}
              </p>
              <p className="mt-1 leading-5">
                These community photos are fetched from the backend, so they do
                not disappear after a page refresh and other visitors can see
                them too.
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
};

export default EventPhotos;
