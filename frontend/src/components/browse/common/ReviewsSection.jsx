// frontend/src/components/browse/sections/ReviewsSection.jsx
import React, { useState } from "react";
import { Star, ThumbsUp, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useBrowse } from "@/hooks";
import { ROUTES } from "@/app/AppRoutes";
import SectionShell from "./SectionShell";

const timeAgo = (iso) => {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d < 1) return "Today"; if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`; return `${Math.floor(d / 30)}mo ago`;
};

const StarRow = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map((i) => (
      <Star key={i} size={11} className={i <= rating ? "text-foreground fill-foreground" : "text-border"} />
    ))}
  </div>
);

const ReviewCard = ({ review }) => {
  const [helpful, setHelpful] = useState(review.helpful);
  const [voted, setVoted] = useState(false);
  return (
    <div className="p-4 rounded-lg border border-border bg-card hover:border-foreground/15 transition-all">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>{review.avatar}</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>{review.reviewer}</p>
            <p className="text-[10px] text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>{timeAgo(review.date)}</p>
          </div>
        </div>
        <StarRow rating={review.rating} />
      </div>
      <div className="relative mb-3">
        <Quote size={14} className="text-primary/30 mb-1" />
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3" style={{ fontFamily: "var(--font-sans)" }}>{review.text}</p>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <p className="text-[10px] text-muted-foreground truncate max-w-[60%]" style={{ fontFamily: "var(--font-sans)" }}>
          Ticket Bro community feedback
        </p>
        <button onClick={() => { if (!voted) { setHelpful((p) => p + 1); setVoted(true); } }}
          className={`flex items-center gap-1 text-[10px]  ${voted ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
          style={{ fontFamily: "var(--font-sans)" }}>
          <ThumbsUp size={10} />{helpful}
        </button>
      </div>
    </div>
  );
};

const ReviewsSection = () => {
  const { getReviews } = useBrowse();
  const reviews = getReviews();
  const [page, setPage] = useState(0);
  if (!reviews.length) return null;
  const perPage = 3;
  const totalPages = Math.ceil(reviews.length / perPage);
  const visible = reviews.slice(page * perPage, page * perPage + perPage);
  return (
    <SectionShell title="What People Say" subtitle="Recent Ticket Bro reviews from the community" icon={Star} viewAllHref={ROUTES.REVIEWS.ROOT}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((r) => <ReviewCard key={r.id} review={r} />)}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
            className="flex items-center justify-center w-8 h-8 rounded-md border border-border text-muted-foreground hover:bg-accent disabled:opacity-40">
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>{page + 1} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
            className="flex items-center justify-center w-8 h-8 rounded-md border border-border text-muted-foreground hover:bg-accent disabled:opacity-40">
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </SectionShell>
  );
};

export default ReviewsSection;
