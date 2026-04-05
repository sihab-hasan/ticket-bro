import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, MessageSquare, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/shared/PageHeader";
import { toast } from "@/components/shared/common";
import { ROUTES } from "@/config/routes.config";
import { reviewsService } from "@/api";
import { getApiErrorMessage, normalizeApiError } from "@/api/client";

const StarRating = ({ rating, onChange }) => (
  <div className="flex items-center gap-2">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className="transition-transform hover:scale-110 active:scale-95"
      >
        <Star
          className={`h-8 w-8 transition-colors ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/30 hover:text-yellow-400/50"
          }`}
        />
      </button>
    ))}
    <span className="ml-1 text-sm text-muted-foreground">
      {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
    </span>
  </div>
);

const ExistingReviewState = ({ review, onViewReviews }) => (
  <div className="mx-auto max-w-md space-y-4 px-4 pt-12 text-center font-sans sm:px-6">
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
      <MessageSquare className="h-8 w-8 text-amber-500" />
    </div>
    <h2 className="text-xl font-extrabold font-heading">Review already submitted</h2>
    <p className="text-sm text-muted-foreground">
      You can only keep one active Ticket Bro review at a time.
    </p>
    <Card className="text-left">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">Your current review</p>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((value) => (
              <Star
                key={value}
                className={`h-4 w-4 ${
                  value <= Number(review?.rating || 0)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>
        {review?.title ? <p className="text-sm font-medium">{review.title}</p> : null}
        {review?.body ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{review.body}</p>
        ) : null}
      </CardContent>
    </Card>
    <div className="flex flex-col gap-2">
      <Button onClick={onViewReviews} className="w-full font-bold">
        View All Reviews
      </Button>
      <Button
        variant="ghost"
        onClick={() => window.history.back()}
        className="text-muted-foreground"
      >
        Go Back
      </Button>
    </div>
  </div>
);

const WriteReviewPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedReview, setSubmittedReview] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [form, setForm] = useState({ rating: 0, title: "", body: "" });

  useEffect(() => {
    let active = true;

    const loadMyReview = async () => {
      try {
        const review = await reviewsService.getMyReview();
        if (!active) {
          return;
        }
        setExistingReview(review || null);
      } catch {
        toast.error("Failed to load your review status");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadMyReview();

    return () => {
      active = false;
    };
  }, []);

  const loadExistingReview = async () => {
    try {
      const review = await reviewsService.getMyReview();
      setExistingReview(review || null);
    } catch {
      setExistingReview({
        rating: form.rating,
        title: form.title,
        body: form.body,
      });
    }
  };

  const handleSubmit = async () => {
    if (form.rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!form.body.trim()) {
      toast.error("Please write a review");
      return;
    }

    setSubmitting(true);

    try {
      const createdReview = await reviewsService.create({
        rating: form.rating,
        title: form.title.trim(),
        body: form.body.trim(),
      });
      setSubmittedReview(createdReview);
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.status === 409) {
        await loadExistingReview();
      } else {
        toast.error(getApiErrorMessage(error, "Failed to submit review"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="content-shell"><div className="mx-auto max-w-lg space-y-4 py-4 sm:py-6">
        {[1, 2].map((index) => (
          <Skeleton key={index} className="h-32 rounded-2xl" />
        ))}
      </div></div>
    );
  }

  if (submittedReview) {
    return (
      <div className="content-shell"><div className="mx-auto max-w-md space-y-4 pt-12 text-center font-sans">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
          <CheckCircle2 className="h-8 w-8 text-yellow-500" />
        </div>
        <h2 className="text-xl font-extrabold font-heading">Review submitted</h2>
        <p className="text-sm text-muted-foreground">
          Thanks for sharing your Ticket Bro experience. Your rating is now part
          of the app-wide average.
        </p>
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => navigate(ROUTES.REVIEWS.ROOT)}
            className="w-full font-bold"
          >
            See All Reviews
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate(ROUTES.HOME)}
            className="text-muted-foreground"
          >
            Back to Home
          </Button>
        </div>
      </div></div>
    );
  }

  if (existingReview) {
    return (
      <ExistingReviewState
        review={existingReview}
        onViewReviews={() => navigate(ROUTES.REVIEWS.ROOT)}
      />
    );
  }

  return (
    <div className="content-shell" aria-label="Write a review"><div className="mx-auto max-w-lg space-y-5 py-4 font-sans sm:py-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title="Write a Review"
          subtitle="Share your experience using Ticket Bro"
          className="mb-0"
        />
      </div>

      <Card>
        <CardContent className="space-y-5 p-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Overall Rating *</Label>
            <StarRating
              rating={form.rating}
              onChange={(value) => setForm((current) => ({ ...current, rating: value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Review Title (optional)</Label>
            <Input
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              placeholder="Summarize your experience..."
              className="h-9"
              maxLength={100}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Your Review *</Label>
            <Textarea
              value={form.body}
              onChange={(event) =>
                setForm((current) => ({ ...current, body: event.target.value }))
              }
              placeholder="Tell others what stood out about your Ticket Bro experience..."
              rows={6}
              className="resize-none text-sm"
              maxLength={2000}
            />
            <p className="text-right text-[11px] text-muted-foreground">
              {form.body.length}/2000
            </p>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSubmit}
        disabled={submitting || form.rating === 0}
        className="h-11 w-full text-base font-bold"
      >
        {submitting ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Submitting...
          </>
        ) : (
          <>
            <Star className="mr-2 h-5 w-5" />
            Submit Review
          </>
        )}
      </Button>
    </div></div>
  );
};

export default WriteReviewPage;
