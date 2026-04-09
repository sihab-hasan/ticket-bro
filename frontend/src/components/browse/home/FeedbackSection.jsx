import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Quote,
  Star,
  TrendingUp,
} from "lucide-react";
import Container from "@/components/layout/Container";
import { ROUTES } from "@/app/AppRoutes";
import { reviewsService } from "@/api";
import { getApiErrorMessage, normalizeApiError } from "@/api/client";
import { useBrowseContext } from "@/context/BrowseContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/shared/common";

const FeedbackSection = () => {
  const navigate = useNavigate();
  const { reviews, refreshBrowseData } = useBrowseContext();
  const { isAuthenticated } = useAuth();

  const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0 });
  const [userRating, setUserRating] = useState(0);
  const [body, setBody] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myReview, setMyReview] = useState(null);
  const [status, setStatus] = useState("idle");

  const recentReviews = useMemo(() => (reviews || []).slice(0, 3), [reviews]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoadingSummary(true);

      try {
        const [summaryData, myReviewData] = await Promise.all([
          reviewsService.getSummary(),
          isAuthenticated
            ? reviewsService.getMyReview().catch(() => null)
            : Promise.resolve(null),
        ]);

        if (!active) {
          return;
        }

        setSummary(summaryData || { averageRating: 0, totalReviews: 0 });
        setMyReview(myReviewData || null);
        setStatus(myReviewData ? "duplicate" : "idle");
      } catch {
        if (active) {
          toast.error("Failed to load review feedback");
        }
      } finally {
        if (active) {
          setLoadingSummary(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const reloadData = async () => {
    const [summaryData, myReviewData] = await Promise.all([
      reviewsService.getSummary(),
      isAuthenticated
        ? reviewsService.getMyReview().catch(() => null)
        : Promise.resolve(null),
      refreshBrowseData(),
    ]);

    setSummary(summaryData || { averageRating: 0, totalReviews: 0 });
    setMyReview(myReviewData || null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      navigate(ROUTES.REVIEWS.WRITE());
      return;
    }

    if (myReview) {
      setStatus("duplicate");
      return;
    }

    if (!userRating) {
      toast.error("Please choose a rating");
      return;
    }

    if (!body.trim()) {
      toast.error("Please share a few words");
      return;
    }

    setSubmitting(true);

    try {
      const createdReview = await reviewsService.create({
        rating: userRating,
        body: body.trim(),
      });

      setMyReview(createdReview);
      setStatus("success");
      setBody("");
      setUserRating(0);
      await reloadData();
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.status === 409) {
        setStatus("duplicate");
        await reloadData();
      } else {
        toast.error(getApiErrorMessage(error, "Failed to submit feedback"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const average = Number(summary?.averageRating || 0);
  const total = Number(summary?.totalReviews || 0);
  const showSuccess = status === "success";
  const showDuplicate = status === "duplicate" && !showSuccess;

  return (
    <section className="bg-background py-20 transition-colors duration-300">
      <Container>
        <div className="mb-12 flex flex-col justify-between gap-4 border-l-4 border-lime-500 pl-6 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-black uppercase leading-none tracking-tighter text-lime-500 md:text-4xl">
              Review and Rating
            </h2>
            <p className="mt-3 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              Community Ratings and Live Feedback
            </p>
          </div>
          <Link
            to={ROUTES.REVIEWS.ROOT}
            className="flex items-center gap-2 pb-1 text-[10px] font-black uppercase tracking-widest text-lime-500 transition-colors hover:text-lime-400"
          >
            See All Reviews <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-border bg-card p-8 text-center shadow-sm">
            <h4 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Global Satisfaction
            </h4>
            <div className="mb-2 text-6xl font-black text-foreground">
              {loadingSummary ? "--" : average.toFixed(1)}
            </div>
            <div className="mb-4 flex gap-1 text-lime-500">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  size={16}
                  fill={index < Math.round(average) ? "currentColor" : "none"}
                />
              ))}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              From {loadingSummary ? "..." : total.toLocaleString()} users
            </p>
          </div>

          <div className="rounded-[2.5rem] border border-border bg-card p-8 shadow-sm lg:col-span-2">
            {showSuccess ? (
              <div className="py-6 text-center">
                <CheckCircle2 size={40} className="mx-auto mb-4 text-lime-500" />
                <h3 className="text-xl font-black uppercase text-foreground">
                  Feedback Received
                </h3>
                <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                  Your review has been added to the app rating.
                </p>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.REVIEWS.ROOT)}
                    className="rounded-xl bg-lime-500 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-black shadow-lg shadow-lime-500/20"
                  >
                    View Reviews
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="rounded-xl border border-border px-6 py-3 text-[10px] font-black uppercase tracking-widest text-foreground"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : showDuplicate ? (
              <div className="py-6 text-center">
                <AlertCircle size={40} className="mx-auto mb-4 text-amber-500" />
                <h3 className="text-xl font-black uppercase text-foreground">
                  Review Already Submitted
                </h3>
                <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                  Each user can keep one active Ticket Bro review.
                </p>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.REVIEWS.ROOT)}
                    className="rounded-xl bg-lime-500 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-black shadow-lg shadow-lime-500/20"
                  >
                    View Reviews
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.REVIEWS.WRITE())}
                    className="rounded-xl border border-border px-6 py-3 text-[10px] font-black uppercase tracking-widest text-foreground"
                  >
                    Open Review Page
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
                    Share Your Experience
                  </span>
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        className={`transition-all ${
                          userRating >= star
                            ? "scale-110 text-lime-500"
                            : "text-muted-foreground/30"
                        }`}
                      >
                        <Star
                          size={24}
                          fill={userRating >= star ? "currentColor" : "none"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    placeholder="Describe your thoughts..."
                    required
                    rows={4}
                    className="w-full rounded-2xl border border-border bg-background px-6 py-5 pr-32 text-sm text-foreground transition-all focus:border-lime-500/50 focus:outline-none"
                  />
                  <button
                    disabled={submitting || userRating === 0}
                    type="submit"
                    className={`absolute right-3 top-3 rounded-xl px-8 py-3 text-[10px] font-black uppercase transition-all ${
                      submitting || userRating === 0
                        ? "bg-muted text-muted-foreground"
                        : "bg-lime-500 text-black shadow-lg shadow-lime-500/20 active:scale-95"
                    }`}
                  >
                    {submitting ? "Sending..." : isAuthenticated ? "Submit" : "Sign In"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {recentReviews.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-[2.5rem] border border-border bg-card p-8 shadow-sm transition-all hover:border-lime-500/30"
            >
              <Quote className="absolute -right-2 -top-2 h-24 w-24 text-foreground/5 transition-colors group-hover:text-lime-500/5" />
              <div className="mb-4 flex gap-0.5 text-lime-500">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    size={12}
                    fill={index < item.rating ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <p className="relative z-10 mb-8 text-sm font-medium italic leading-relaxed text-muted-foreground">
                "{item.text}"
              </p>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-muted text-xs font-black italic text-foreground">
                  {item.initial}
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">
                    {item.reviewer}
                  </h4>
                  <p className="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground">
                    Ticket Bro user
                  </p>
                </div>
              </div>
            </div>
          ))}
          {!recentReviews.length ? (
            <div className="rounded-[2.5rem] border border-dashed border-border bg-card p-8 text-center md:col-span-3">
              <TrendingUp className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-semibold text-foreground">
                No public reviews yet
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Share the first Ticket Bro review to get the community started.
              </p>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
};

export default FeedbackSection;
