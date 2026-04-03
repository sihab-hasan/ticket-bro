import React, { useMemo, useState } from "react";
import { BadgeCheck, ChevronDown, Star, ThumbsUp } from "lucide-react";
import {
  AvatarCircle,
  SectionHeading,
  StarRow,
  timeAgo,
} from "./shared/EventShared.jsx";

const buildRatingDistribution = (reviews) => {
  if (!reviews.length) {
    return [
      { stars: 5, pct: 0 },
      { stars: 4, pct: 0 },
      { stars: 3, pct: 0 },
      { stars: 2, pct: 0 },
      { stars: 1, pct: 0 },
    ];
  }

  return [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((review) => Math.round(review.rating) === stars).length;
    return {
      stars,
      pct: Math.round((count / reviews.length) * 100),
    };
  });
};

const EventReviewsSection = ({ event, reviews = [] }) => {
  const [helpfulSet, setHelpfulSet] = useState(new Set());
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? reviews : reviews.slice(0, 3);
  const rating = Number(event.averageRating || 0);
  const total = Number(event.reviewCount || reviews.length || 0);
  const distribution = useMemo(() => buildRatingDistribution(reviews), [reviews]);

  const toggle = (id) =>
    setHelpfulSet((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading>
        Reviews
        <span className="ml-1 text-sm font-normal text-muted-foreground">
          ({total.toLocaleString()})
        </span>
      </SectionHeading>

      <div
        className="flex gap-6 rounded-2xl border border-border p-5"
        style={{ background: "var(--card)" }}
      >
        <div className="flex shrink-0 flex-col items-center justify-center gap-1">
          <p
            className="text-5xl font-extrabold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {rating.toFixed(1)}
          </p>
          <StarRow rating={rating} size={13} />
          <p
            className="text-[11px] text-muted-foreground"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {total.toLocaleString()} reviews
          </p>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-1.5">
          {distribution.map(({ stars, pct }) => (
            <div key={stars} className="flex items-center gap-2">
              <span
                className="w-2 shrink-0 text-[11px] font-medium text-foreground"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {stars}
              </span>
              <Star
                size={9}
                className="shrink-0 fill-foreground text-foreground"
              />
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: "var(--foreground)" }}
                />
              </div>
              <span
                className="w-7 shrink-0 text-right text-[11px] text-muted-foreground"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {!reviews.length ? (
        <div
          className="rounded-xl border border-border p-4 text-sm text-muted-foreground"
          style={{ background: "var(--card)", fontFamily: "var(--font-sans)" }}
        >
          No attendee reviews have been published for this event yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-border p-4"
              style={{ background: "var(--card)" }}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <AvatarCircle initial={review.initial} size={2.5} />
                  <div>
                    <div className="flex items-center gap-1">
                      <p
                        className="text-xs font-semibold text-foreground"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        {review.author}
                      </p>
                      {review.verified && (
                        <BadgeCheck size={11} className="text-foreground" />
                      )}
                    </div>
                    <p
                      className="text-[10px] text-muted-foreground"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {timeAgo(review.createdAt)}
                    </p>
                  </div>
                </div>
                <StarRow rating={review.rating} size={11} />
              </div>

              {review.title && (
                <p
                  className="mb-1 text-xs font-bold text-foreground"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {review.title}
                </p>
              )}

              <p
                className="text-xs leading-relaxed text-muted-foreground"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {review.body}
              </p>

              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span
                  className="text-[10px] text-muted-foreground"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Helpful?
                </span>
                <button
                  onClick={() => toggle(review.id)}
                  className="flex items-center gap-1.5 text-[11px] transition-colors"
                  style={{
                    color: helpfulSet.has(review.id)
                      ? "var(--foreground)"
                      : "var(--muted-foreground)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <ThumbsUp
                    size={11}
                    className={helpfulSet.has(review.id) ? "fill-foreground" : ""}
                  />
                  {Number(review.helpful || 0) + (helpfulSet.has(review.id) ? 1 : 0)}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {reviews.length > 3 && (
        <button
          onClick={() => setShowAll((current) => !current)}
          className="self-start text-xs font-semibold text-foreground transition-opacity hover:opacity-70"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          <span className="inline-flex items-center gap-1.5 underline underline-offset-2">
            <ChevronDown
              size={12}
              className={showAll ? "rotate-180 transition-transform" : "transition-transform"}
            />
            {showAll
              ? "Show fewer reviews"
              : `View all ${total.toLocaleString()} reviews`}
          </span>
        </button>
      )}
    </div>
  );
};

export default EventReviewsSection;
