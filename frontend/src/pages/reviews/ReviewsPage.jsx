import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, RefreshCw, Star, ThumbsUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/shared/PageHeader";
import { formatDate } from "@/utils/formatters";
import { toast } from "@/components/shared/common";
import { ROUTES } from "@/app/AppRoutes";
import { reviewsService } from "@/api";

const Stars = ({ rating, size = "sm" }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((value) => (
      <Star
        key={value}
        className={`${
          size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5"
        } ${
          value <= rating
            ? "fill-yellow-400 text-yellow-400"
            : "text-muted-foreground/30"
        }`}
      />
    ))}
  </div>
);

const ReviewsPage = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadReviews = useCallback(async (targetPage = 1) => {
    const isFirstPage = targetPage === 1;
    if (isFirstPage) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const [reviewsData, summaryData] = await Promise.all([
        reviewsService.getAll({
          page: targetPage,
          limit: 10,
          sort: "-createdAt",
        }),
        isFirstPage ? reviewsService.getSummary() : Promise.resolve(null),
      ]);

      const nextReviews = reviewsData?.reviews || [];
      const pagination = reviewsData?.pagination || {};

      if (isFirstPage) {
        setSummary(summaryData || null);
        setReviews(nextReviews);
      } else {
        setReviews((current) => [...current, ...nextReviews]);
      }

      setPage(targetPage);
      setHasMore(
        Number(pagination.page || targetPage) < Number(pagination.totalPages || 1),
      );
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadReviews(1);
  }, [loadReviews]);

  const averageRating = Number(summary?.averageRating || 0);
  const totalReviews = Number(summary?.totalReviews || 0);
  const ratingDistribution = summary?.ratingDistribution || [];

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4 font-sans sm:p-6">
      <PageHeader
        title="Reviews"
        subtitle="App-wide feedback from the Ticket Bro community"
        actions={[
          {
            label: "Refresh",
            icon: RefreshCw,
            onClick: () => loadReviews(1),
            variant: "outline",
          },
          {
            label: "Write Review",
            icon: Star,
            onClick: () => navigate(ROUTES.REVIEWS.WRITE),
          },
        ]}
      />

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-2xl" />
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="flex flex-col gap-5 p-5 sm:flex-row">
              <div className="text-center sm:border-r sm:border-border sm:pr-5">
                <p className="text-4xl font-extrabold font-heading">
                  {averageRating.toFixed(1)}
                </p>
                <Stars rating={Math.round(averageRating)} size="lg" />
                <p className="mt-1 text-xs text-muted-foreground">
                  {totalReviews} review{totalReviews === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count =
                    ratingDistribution.find((item) => item.rating === rating)
                      ?.count || 0;
                  const percent = totalReviews ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="w-4 shrink-0 text-right text-xs">
                        {rating}
                      </span>
                      <Star className="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400" />
                      <Progress value={percent} className="h-2 flex-1" />
                      <span className="w-8 shrink-0 text-right text-xs text-muted-foreground">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {reviews.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-16 text-center">
                <MessageSquare className="mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-semibold">No reviews yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Be the first person to rate the Ticket Bro experience.
                </p>
                <Button
                  className="mt-4 font-bold"
                  onClick={() => navigate(ROUTES.REVIEWS.WRITE)}
                >
                  <Star className="mr-2 h-4 w-4" />
                  Write Review
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review._id}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                          {review.user?.firstName?.[0]}
                          {review.user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold">
                            {review.user?.firstName} {review.user?.lastName}
                          </p>
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {formatDate(review.createdAt, {
                              dateStyle: "medium",
                              timeStyle: undefined,
                            })}
                          </span>
                        </div>
                        <Stars rating={review.rating} />
                        {review.title ? (
                          <p className="mt-2 text-sm font-semibold">
                            {review.title}
                          </p>
                        ) : null}
                        {review.body ? (
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            {review.body}
                          </p>
                        ) : null}
                        {review.event?.title ? (
                          <p className="mt-2 text-[11px] text-muted-foreground">
                            Legacy event context: {review.event.title}
                          </p>
                        ) : null}
                        {Number(review.helpful || 0) > 0 ? (
                          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            <ThumbsUp className="h-3 w-3" />
                            {review.helpful} found this helpful
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {hasMore ? (
                <Button
                  variant="outline"
                  className="w-full font-semibold"
                  disabled={loadingMore}
                  onClick={() => loadReviews(page + 1)}
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </Button>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewsPage;
