// pages/reviews/WriteReviewPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/shared/PageHeader';
import { formatDate } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/app/AppRoutes';
import { eventsService, reviewsService } from '@/api';
import { getApiErrorMessage } from '@/api/client';

const StarRating = ({ rating, onChange }) => (
  <div className="flex items-center gap-2">
    {[1,2,3,4,5].map((star) => (
      <button key={star} type="button" onClick={() => onChange(star)} className="transition-transform hover:scale-110 active:scale-95">
        <Star className={`h-8 w-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30 hover:text-yellow-400/50'} transition-colors`} />
      </button>
    ))}
    <span className="text-sm text-muted-foreground ml-1">{['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}</span>
  </div>
);

const WriteReviewPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ rating: 0, title: '', comment: '' });

  useEffect(() => {
    (async () => {
      try {
        setEvent(await eventsService.getEventBySlug(eventId));
      } catch { toast.error('Event not found'); navigate(-1); }
      finally { setLoading(false); }
    })();
  }, [eventId, navigate]);

  const handleSubmit = async () => {
    if (form.rating === 0) return toast.error('Please select a rating');
    if (!form.comment.trim()) return toast.error('Please write a comment');
    setSubmitting(true);
    try {
      await reviewsService.create({ ...form, eventId: event?._id || eventId });
      setSubmitted(true);
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to submit review'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-4 space-y-4 max-w-lg mx-auto">{[1,2].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>;

  if (submitted) return (
    <div className="p-4 sm:p-6 max-w-md mx-auto text-center space-y-4 font-sans pt-12">
      <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto">
        <CheckCircle2 className="h-8 w-8 text-yellow-500" />
      </div>
      <h2 className="text-xl font-extrabold font-heading">Review Submitted!</h2>
      <p className="text-sm text-muted-foreground">Thank you for sharing your experience. Your review helps others discover great events.</p>
      <div className="flex flex-col gap-2">
        <Button onClick={() => navigate(ROUTES.REVIEWS.EVENT(eventId))} className="w-full font-bold">See All Reviews</Button>
        <Button variant="ghost" onClick={() => navigate(ROUTES.BOOKINGS.ROOT)} className="text-muted-foreground">Back to Bookings</Button>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-5 font-sans">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <PageHeader title="Write a Review" subtitle={event?.title} className="mb-0" />
      </div>

      {/* Event card */}
      <Card>
        <CardContent className="p-4 flex gap-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0">
            {event?.coverImage && <img src={event.coverImage} alt="" className="w-full h-full object-cover" />}
          </div>
          <div>
            <p className="text-sm font-bold">{event?.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{formatDate(event?.startDate, { dateStyle: 'medium', timeStyle: undefined })}</p>
            <p className="text-xs text-muted-foreground">{event?.venue?.city || 'Online'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Review form */}
      <Card>
        <CardContent className="p-5 space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Overall Rating *</Label>
            <StarRating rating={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Review Title (optional)</Label>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Summarize your experience…" className="h-9" maxLength={100} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Your Review *</Label>
            <Textarea value={form.comment} onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))} placeholder="Tell others what you liked (or didn't like) about this event…" rows={6} className="text-sm resize-none" maxLength={2000} />
            <p className="text-[11px] text-muted-foreground text-right">{form.comment.length}/2000</p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} disabled={submitting || form.rating === 0} className="w-full h-11 font-bold text-base">
        {submitting ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />Submitting…</> : <><Star className="h-5 w-5 mr-2" />Submit Review</>}
      </Button>
    </div>
  );
};

export default WriteReviewPage;
