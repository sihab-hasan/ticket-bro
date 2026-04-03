// pages/reviews/ReviewsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ThumbsUp, MessageSquare, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/shared/PageHeader';
import { formatDate } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/app/AppRoutes';
import { reviewsService } from '@/api';

const Stars = ({ rating, size = 'sm' }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map((i) => (
      <Star key={i} className={`${size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5'} ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
    ))}
  </div>
);

const ReviewsPage = () => {
  const { eventId } = useParams();
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetch = async (p = 1) => {
    setLoading(p === 1);
    try {
      const [reviewsData, summary] = await Promise.all([
        reviewsService.getByEvent(eventId, { page: p, limit: 10 }),
        p === 1 ? reviewsService.getSummary(eventId) : Promise.resolve(data || null),
      ]);

      if (p === 1) {
        setData({
          ...summary,
          reviews: reviewsData.reviews || [],
          totalReviews:
            summary?.totalReviews ||
            reviewsData.total ||
            reviewsData.pagination?.total ||
            0,
        });
        setReviews(reviewsData.reviews || []);
      } else {
        setReviews((prev) => [...prev, ...(reviewsData.reviews || [])]);
      }

      setHasMore((reviewsData.pagination?.page || p) < (reviewsData.pagination?.totalPages || 1));
      setPage(p);
    } catch { toast.error('Failed to load reviews'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(1); }, [eventId]);

  const ratingDist = data?.ratingDistribution || [];

  return (
    <div className="p-4 sm:p-6 space-y-5 font-sans max-w-2xl mx-auto">
      <PageHeader title="Reviews" subtitle={data?.event?.title}
        actions={[{ label: 'Write Review', icon: Star, onClick: () => {}, variant: 'default' }]}
      />

      {/* Summary */}
      {data && (
        <Card>
          <CardContent className="p-5 flex flex-col sm:flex-row gap-5">
            <div className="text-center sm:border-r sm:border-border sm:pr-5">
              <p className="text-4xl font-extrabold font-heading">{data.avgRating?.toFixed(1)}</p>
              <Stars rating={Math.round(data.avgRating || 0)} size="lg" />
              <p className="text-xs text-muted-foreground mt-1">{data.totalReviews} reviews</p>
            </div>
            <div className="flex-1 space-y-2">
              {[5,4,3,2,1].map((star) => {
                const count = ratingDist.find((r) => r.rating === star)?.count || 0;
                const pct = data.totalReviews ? (count / data.totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs w-4 text-right shrink-0">{star}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
                    <Progress value={pct} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground w-8 text-right shrink-0">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews list */}
      {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />) :
        reviews.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center py-16"><MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-3" /><p className="text-sm text-muted-foreground">No reviews yet</p></CardContent></Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <Card key={r._id}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9 shrink-0"><AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">{r.user?.firstName?.[0]}{r.user?.lastName?.[0]}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold">{r.user?.firstName} {r.user?.lastName}</p>
                        <span className="text-[11px] text-muted-foreground shrink-0">{formatDate(r.createdAt, { dateStyle: 'medium', timeStyle: undefined })}</span>
                      </div>
                      <Stars rating={r.rating} />
                      {r.title && <p className="text-sm font-semibold mt-2">{r.title}</p>}
                      {r.comment && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{r.comment}</p>}
                      {r.helpfulCount > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <ThumbsUp className="h-3 w-3" />{r.helpfulCount} found this helpful
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {hasMore && (
              <Button variant="outline" className="w-full font-semibold" onClick={() => fetch(page + 1)}>Load More</Button>
            )}
          </div>
        )
      }
    </div>
  );
};

export default ReviewsPage;
